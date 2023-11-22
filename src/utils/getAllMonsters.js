export default async function getAllMonsters() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list');
  const { data } = await response.json();
  const monsters = data.books.reduce((all, book) => [
    ...all,
    ...book.monster.gene1,
    ...book.monster.gene2,
    ...book.monster.gene3,
    ...book.monster.gene4,
    ...book.monster.gene5,
  ], []);
  return monsters;
}
