// Simple everyday phrases for typing test
export const typingTexts = [
  "Le soleil brille ce matin et les oiseaux chantent dans les arbres du jardin. Une belle journée commence pour tout le monde.",
  "La lecture est un voyage immobile qui permet de découvrir des mondes nouveaux sans quitter son fauteuil préféré.",
  "Les enfants jouent dans le parc pendant que leurs parents discutent sur les bancs à côté de la fontaine.",
  "Une tasse de café chaud le matin aide à bien commencer la journée et à se préparer pour le travail.",
  "Les fleurs du printemps apportent de la couleur et de la joie dans les rues de la ville après un long hiver.",
  "La musique adoucit les mœurs et permet de se détendre après une longue journée de travail intense.",
  "Le petit chat dort paisiblement sur le canapé pendant que la pluie tombe doucement sur les fenêtres.",
  "Cuisiner un bon repas pour sa famille est une façon simple de montrer son amour et son attention.",
  "La mer est calme ce soir et les vagues viennent lécher doucement le sable de la plage déserte.",
  "Apprendre une nouvelle compétence demande de la patience et de la persévérance mais le résultat vaut effort.",
  "Le vélo est un excellent moyen de transport pour explorer la ville tout en faisant de exercice physique.",
  "Les étoiles brillent dans le ciel nocturne et la lune éclaire le chemin des promeneurs tardifs.",
  "Un bon livre et une couverture chaude sont les ingrédients parfaits pour une soirée hivernale réussie.",
  "Le marché du dimanche offre des fruits et légumes frais cultivés par les agriculteurs de la région.",
  "Prendre le temps de respirer et de réfléchir est essentiel pour maintenir un équilibre dans sa vie.",
];

export function getRandomText(): string {
  return typingTexts[Math.floor(Math.random() * typingTexts.length)];
}
