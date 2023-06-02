
const randomToken = (n: number): string => {
    const vocals: string[] = ['a', 'e', 'i', 'o', 'u'];
    const consonants: string[] = [
      'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'
    ]; 
    const getRandomItem = (array: string[]): string => array[Math.floor(Math.random() * array.length)];
  
    let combination = '';
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) {
        combination += getRandomItem(consonants);
      } else {
        combination += getRandomItem(vocals);
      }
    }
    return combination;
  };
  export { randomToken };