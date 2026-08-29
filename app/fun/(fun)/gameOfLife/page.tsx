"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  inventRule,
  occupancy,
  parseRules,
  readSignature,
  mulberry32,
  seedWorld,
  serialiseRules,
  signatureFor,
  step,
  type moveAction,
  type ruleTable,
  type tile,
} from "./automaton"
import styles from "./gameOfLife.module.css"

/* ============================================================================
   GAME OF LIFE

   Tiles that read their neighbours and decide where to move. The rules for
   what a given neighbourhood means are not written by anyone — the first time
   a tile ever sees a particular arrangement of neighbours, a rule is invented
   for it and kept. So the rule table grows as the world runs, and after a few
   hundred generations it holds a few hundred rules nobody chose.

   The logic lives in automaton.ts, on purpose: it is all pure functions over a
   world object, so the same code runs the loop, the single step and the
   preview in the rule inspector.

   Click any tile to see the neighbourhood it is looking at and the rule that
   arrangement maps to, and to change that rule. Every tile in the world that
   ever sees the same arrangement will follow the edit.
   ========================================================================= */

const MOVES: moveAction[] = ["up", "down", "left", "right"]

const MOVE_ARROW: Record<moveAction, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
}

export default function Page() {
  const [size, sizeSet] = useState(40)
  const [density, densitySet] = useState(0.1)
  const [speed, speedSet] = useState(500)
  const [running, runningSet] = useState(true)
  const [autoGenerate, autoGenerateSet] = useState(true)

  /* ---- The world ---------------------------------------------------------
     One object, replaced whole. The tiles and the rule table change together
     every generation, so splitting them into two pieces of state only creates
     a moment where they disagree.

     The ref is the authority and the state is the render mirror: step() is not
     pure — it invents rules — so it must not run inside a setState updater,
     which React is free to call twice. */
  const [world, worldSet] = useState(() => ({
    // Fixed seed for the first world so the server and the browser lay out the
    // same one. Reseeding uses Math.random.
    tiles: seedWorld(40, 0.1, 0.02, mulberry32(20260829)),
    rules: {} as ruleTable,
    generation: 0,
    learned: 0,
  }))

  const worldRef = useRef(world)

  const commit = useCallback((next: typeof world) => {
    worldRef.current = next
    worldSet(next)
  }, [])

  const [selectedSignature, selectedSignatureSet] = useState<string | null>(null)
  const [panel, panelSet] = useState<"world" | "rules">("world")
  const [rulesText, rulesTextSet] = useState("")
  const [message, messageSet] = useState<string | null>(null)

  const { tiles, rules, generation, learned: lastLearned } = world

  /* ---- The loop ----------------------------------------------------------
     One interval that can be cleared, rather than a setTimeout calling itself
     — the original could not be stopped and ran twice under Strict Mode. */
  const advance = useCallback(() => {
    const current = worldRef.current
    const result = step({ size, tiles: current.tiles, rules: current.rules, generation: current.generation }, autoGenerate)

    commit({
      tiles: result.tiles,
      rules: result.rules,
      generation: current.generation + 1,
      learned: result.learned.length,
    })
  }, [size, autoGenerate, commit])

  useEffect(() => {
    if (!running) return

    const timer = window.setInterval(advance, speed)
    return () => window.clearInterval(timer)
  }, [running, speed, advance])

  /* ---- Reseeding ---------------------------------------------------------- */
  const reseed = (nextSize = size, nextDensity = density) => {
    commit({ tiles: seedWorld(nextSize, nextDensity), rules: worldRef.current.rules, generation: 0, learned: 0 })
  }

  const setRules = useCallback(
    (next: ruleTable) => {
      commit({ ...worldRef.current, rules: next })
    },
    [commit],
  )

  const clearRules = () => {
    setRules({})
    selectedSignatureSet(null)
    messageSet("Rule table emptied — it will start learning again.")
  }

  /* ---- Inspecting ---------------------------------------------------------
     The signature is recomputed from the live world so it always matches what
     the tile is actually looking at this generation. */
  const map = useMemo(() => occupancy(tiles), [tiles])

  const inspect = (clicked: tile) => {
    selectedSignatureSet(signatureFor(clicked, map, size))
    setPanelIfNeeded()
  }

  const setPanelIfNeeded = () => {
    if (panel !== "rules") panelSet("rules")
  }

  const selectedActions = selectedSignature === null ? undefined : rules[selectedSignature]

  const setSelectedActions = (actions: moveAction[]) => {
    if (selectedSignature === null) return
    setRules({ ...worldRef.current.rules, [selectedSignature]: actions })
  }

  /* ---- Rules as text ------------------------------------------------------ */
  const copyRules = async () => {
    const text = serialiseRules(rules)
    rulesTextSet(text)

    try {
      await navigator.clipboard.writeText(text)
      messageSet(`Copied ${Object.keys(rules).length} rules.`)
    } catch {
      messageSet("Clipboard blocked — the rules are in the box below.")
    }
  }

  const loadRules = () => {
    const result = parseRules(rulesText)

    if ("error" in result) {
      messageSet(result.error)
      return
    }

    setRules(result.rules)
    messageSet(`Loaded ${Object.keys(result.rules).length} rules.`)
  }

  const ruleEntries = useMemo(() => Object.entries(rules).slice(0, 200), [rules])

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Link href="/fun" className={styles.back}>← Playground</Link>
        <p className="label labelPlain labelSignal">
          Nobody wrote these rules. The world invents one every time it sees
          something new.
        </p>
      </header>

      <div className={styles.layout}>
        {/* ---- The world ------------------------------------------------ */}
        <section className={styles.boardWrap}>
          <div
            className={styles.board}
            style={{ "--size": size } as React.CSSProperties}
          >
            {tiles.map(eachTile => (
              <button
                key={eachTile.id}
                type="button"
                className={styles.tile}
                data-colour={eachTile.colour}
                data-blocked={eachTile.blocked}
                style={{
                  "--column": eachTile.column,
                  "--row": eachTile.row,
                  "--speed": `${speed}ms`,
                } as React.CSSProperties}
                onClick={() => inspect(eachTile)}
                aria-label={`Tile at column ${eachTile.column}, row ${eachTile.row}`}
              />
            ))}
          </div>

          <div className={styles.readout}>
            <span><span className="readout">{generation}</span> generations</span>
            <span className={styles.sep}>·</span>
            <span><span className="readout">{tiles.length}</span> tiles</span>
            <span className={styles.sep}>·</span>
            <span><span className="readout">{Object.keys(rules).length}</span> rules learned</span>
            {lastLearned > 0 && (
              <>
                <span className={styles.sep}>·</span>
                <span className={styles.fresh}>+{lastLearned} new</span>
              </>
            )}
          </div>
        </section>

        {/* ---- Controls -------------------------------------------------- */}
        <aside className={styles.panel}>
          <div className={styles.tabs}>
            {(["world", "rules"] as const).map(eachTab => (
              <button
                key={eachTab}
                type="button"
                data-active={panel === eachTab}
                onClick={() => panelSet(eachTab)}
              >
                {eachTab === "world" ? "World" : `Rules (${Object.keys(rules).length})`}
              </button>
            ))}
          </div>

          {panel === "world" && (
            <div className={styles.group}>
              <div className={styles.buttons}>
                <button
                  type="button"
                  className={`btn btnSm ${running ? "" : "btnPrimary"}`}
                  onClick={() => runningSet(previous => !previous)}
                >
                  <span>{running ? "Pause" : "Play"}</span>
                </button>
                <button type="button" className="btn btnSm" onClick={advance} disabled={running}>
                  <span>Step</span>
                </button>
                <button type="button" className="btn btnSm" onClick={() => reseed()}>
                  <span>Reseed</span>
                </button>
              </div>

              <Slider
                label="Speed"
                display={`${speed}ms`}
                value={1100 - speed}
                min={60}
                max={1040}
                step={20}
                onChange={value => speedSet(1100 - value)}
              />

              <Slider
                label="Grid"
                display={`${size} × ${size}`}
                value={size}
                min={12}
                max={70}
                onChange={value => {
                  sizeSet(value)
                  reseed(value, density)
                }}
              />

              <Slider
                label="Density"
                display={`${Math.round(density * 100)}%`}
                value={Math.round(density * 100)}
                min={1}
                max={40}
                onChange={value => {
                  densitySet(value / 100)
                  reseed(size, value / 100)
                }}
              />

              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={event => autoGenerateSet(event.target.checked)}
                />
                <span>
                  Invent rules for new neighbourhoods
                  <small>
                    {autoGenerate
                      ? "New arrangements get a random rule and keep it"
                      : "Unknown arrangements stand still"}
                  </small>
                </span>
              </label>

              <p className={styles.note}>
                Click any tile to see the eight neighbours it is reading and the
                rule that arrangement maps to.
              </p>
            </div>
          )}

          {panel === "rules" && (
            <div className={styles.group}>
              {selectedSignature !== null ? (
                <div className={styles.inspector}>
                  <p className="label labelPlain">Selected neighbourhood</p>
                  <Pattern signature={selectedSignature} large />

                  <div className={styles.actionRow}>
                    {(selectedActions ?? []).map((eachAction, eachIndex) => (
                      <span key={eachIndex} className={styles.chip}>
                        {MOVE_ARROW[eachAction]}
                      </span>
                    ))}
                    {(selectedActions ?? []).length === 0 && (
                      <span className={styles.chipEmpty}>stays put</span>
                    )}
                  </div>

                  <div className={styles.editRow}>
                    {MOVES.map(eachMove => (
                      <button
                        key={eachMove}
                        type="button"
                        onClick={() => setSelectedActions([...(selectedActions ?? []), eachMove])}
                      >
                        {MOVE_ARROW[eachMove]}
                      </button>
                    ))}
                    <button type="button" onClick={() => setSelectedActions([])}>clear</button>
                    <button type="button" onClick={() => setSelectedActions(inventRule())}>
                      roll
                    </button>
                  </div>
                </div>
              ) : (
                <p className={styles.note}>
                  Click a tile in the world to inspect the arrangement it is
                  looking at.
                </p>
              )}

              <div className={styles.buttons}>
                <button type="button" className="btn btnSm" onClick={copyRules}>
                  <span>Copy rules</span>
                </button>
                <button type="button" className="btn btnSm" onClick={loadRules}>
                  <span>Load rules</span>
                </button>
                <button type="button" className="btn btnSm" onClick={clearRules}>
                  <span>Forget all</span>
                </button>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Paste a rule table here, or press Copy rules to read this world's."
                value={rulesText}
                onChange={event => rulesTextSet(event.target.value)}
                spellCheck={false}
              />

              {message !== null && <p className={styles.message}>{message}</p>}

              <div className={styles.ruleList}>
                {ruleEntries.length === 0 && (
                  <p className={styles.note}>Nothing learned yet. Let it run.</p>
                )}

                {ruleEntries.map(([eachSignature, eachActions]) => (
                  <button
                    key={eachSignature}
                    type="button"
                    className={styles.ruleRow}
                    data-active={eachSignature === selectedSignature}
                    onClick={() => selectedSignatureSet(eachSignature)}
                  >
                    <Pattern signature={eachSignature} />

                    <span className={styles.ruleActions}>
                      {eachActions.length === 0
                        ? "—"
                        : eachActions.map(eachAction => MOVE_ARROW[eachAction]).join(" ")}
                    </span>
                  </button>
                ))}

                {Object.keys(rules).length > ruleEntries.length && (
                  <p className={styles.note}>
                    …and {Object.keys(rules).length - ruleEntries.length} more.
                  </p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}

/* ---- A neighbourhood, drawn ---------------------------------------------
   Three by three with a hole in the middle, which is the tile itself. */
function Pattern({ signature, large }: { signature: string; large?: boolean }) {
  const parts = readSignature(signature)
  const cells = [parts[0], parts[1], parts[2], parts[3], "self", parts[4], parts[5], parts[6], parts[7]]

  return (
    <span className={styles.pattern} data-large={large}>
      {cells.map((eachCell, eachIndex) => (
        <span key={eachIndex} data-cell={eachCell} />
      ))}
    </span>
  )
}

function Slider({
  label,
  display,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  display: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className={styles.slider}>
      <span>{label}</span>
      <em className="readout">{display}</em>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  )
}
