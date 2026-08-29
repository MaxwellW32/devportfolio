import YoutubeUrlParse from "@/useful/YoutubeUrlParse";

export default function DisplayToDoVideo({ id }: { id: string }) {

    return (
        <iframe
            style={{
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
            }}
            src={`https://www.youtube.com/embed/${YoutubeUrlParse(id)}?loop=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    )
}