export function shuffleArray(array: any[]) {
  let currentIndex = array.length, randomIndex;
  console.log(`$re ran`);

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}