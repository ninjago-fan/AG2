// Short cutscenes (see CutsceneScene). One plays the first time you reach each
// level in a run, and one at the very end. Every cutscene can be skipped.
//   theme  - background (same numbers as the levels)
//   left   - texture standing on the left (the hero, if 'player')
//   right  - texture standing on the right (usually the boss)
//   lines  - [speaker, text]; the speaker's name is shown above the text
const STORY = {
  0: {
    theme: 0, left: 'player', right: 'golem1',
    lines: [
      ['', 'LONG AGO, TEN TREASURE CHESTS WERE HIDDEN ACROSS TIME AND SPACE.'],
      ['YOU', 'TEN CHESTS? I ONLY NEED ONE... BUT WHY NOT ALL OF THEM!'],
      ['GRASSY GOLEM', 'THE MEADOW CHEST IS MINE. GO HOME, LITTLE HERO.'],
    ],
  },
  1: {
    theme: 1, left: 'player', right: 'crab_boss1',
    lines: [
      ['', 'DEEP UNDER THE MEADOW, THE CAVE WALLS GLITTER WITH CRYSTALS.'],
      ['CRYSTAL CRAB', 'CLICK CLACK! EVERY GEM IN HERE BELONGS TO ME!'],
    ],
  },
  2: {
    theme: 2, left: 'player', right: 'stranger1',
    lines: [
      ['', 'A CASTLE OF SHADOWS. SOMEONE IS WATCHING FROM THE TOWER...'],
      ['???', 'YOU HAVE COME FAR. BUT NOBODY GETS PAST ME.'],
    ],
  },
  3: {
    theme: 3, left: 'player', right: 'dragon1',
    lines: [
      ['', 'THE AIR GETS HOT. LAVA BUBBLES. A ROAR SHAKES THE MOUNTAIN.'],
      ['THE DARK DRAGON', 'ANOTHER SNACK CLIMBING MY PEAK? HOW KIND.'],
    ],
  },
  4: {
    theme: 5, left: 'player', right: 'tree1',
    lines: [
      ['', 'BEYOND THE PEAK LIES A FOREST WHERE THE SUN NEVER SHINES.'],
      ['YOU', 'WHY DO I FEEL LIKE THE TREES ARE STARING AT ME?'],
      ['THE HAUNTED TREE', 'BECAUSE WE ARE. HOO HOO HOO...'],
    ],
  },
  5: {
    theme: 6, left: 'player', right: 'gateguard1',
    lines: [
      ['', 'A SECRET BASE IN THE DESERT. NOBODY IS SUPPOSED TO KNOW ABOUT IT.'],
      ['PORTAL GATE GUARD', 'HALT! THIS PORTAL IS TOP SECRET. YOU SAW NOTHING!'],
      ['YOU', 'I SAW A PORTAL. AND I AM GOING THROUGH IT.'],
    ],
  },
  6: {
    theme: 7, left: 'player', right: 'giantalien1',
    lines: [
      ['', 'THE PORTAL SPITS YOU OUT ON A PLANET WITH TWO MOONS.'],
      ['THE GIANT ALIEN', 'BLORP! TINY EARTHLING! I WILL SQUISH YOU!'],
    ],
  },
  7: {
    theme: 8, left: 'player', right: 'alienking1',
    lines: [
      ['', 'THE ALIEN KING RULES FROM A CASTLE OF GREEN GLASS.'],
      ['THE ALIEN KING', 'YOU BEAT MY BIG BROTHER? GUARDS! SEIZE THE EARTHLING!'],
    ],
  },
  8: {
    theme: 9, left: 'player', right: 'computer1',
    lines: [
      ['', 'THE KING\'S THRONE WAS A DOOR INTO A WORLD MADE OF CODE.'],
      ['THE SUPER COMPUTER', 'HELLO USER. YOU HAVE BEEN SCHEDULED FOR DELETION.'],
      ['YOU', 'HAVE YOU TRIED TURNING YOURSELF OFF AND ON AGAIN?'],
    ],
  },
  9: {
    theme: 10, left: 'player', right: 'timemaster1',
    lines: [
      ['', 'PAST, PRESENT AND FUTURE SWIRL TOGETHER. MOBS FROM EVERY LEVEL ARE HERE.'],
      ['THE MASTER OF TIME', 'I HID THE CHESTS ACROSS TIME. I KNEW YOU WOULD COME.'],
      ['THE MASTER OF TIME', 'I HAVE ALREADY SEEN HOW THIS ENDS. YOU LOSE.'],
      ['YOU', 'SPOILER ALERT: YOU SAW THE WRONG ENDING.'],
    ],
  },
  ending: {
    theme: 4, left: 'player', right: 'chest_open',
    lines: [
      ['', 'THE MASTER OF TIME FADES AWAY, AND TIME FLOWS NORMALLY AGAIN.'],
      ['YOU', 'TEN CHESTS. TEN BOSSES. ONE VERY TIRED HERO.'],
      ['', 'THE TREASURE IS YOURS. THE END!'],
    ],
  },
};
