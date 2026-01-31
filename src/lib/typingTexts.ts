// Sentences for typing test in different languages
export const typingTexts = {
  fr: [
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
  ],
  en: [
    "The sun is shining this morning and the birds are singing in the garden trees. A beautiful day begins for everyone.",
    "Reading is a motionless journey that allows you to discover new worlds without leaving your favorite armchair.",
    "The children are playing in the park while their parents are chatting on the benches next to the fountain.",
    "A cup of hot coffee in the morning helps to start the day well and get ready for work.",
    "Spring flowers bring color and joy to the city streets after a long winter.",
    "Music soothes the soul and helps to relax after a long day of intense work.",
    "The little cat is sleeping peacefully on the sofa while the rain falls gently on the windows.",
    "Cooking a good meal for your family is a simple way to show your love and care.",
    "The sea is calm tonight and the waves gently lap the sand of the deserted beach.",
    "Learning a new skill requires patience and perseverance but the result is worth the effort.",
    "The bicycle is an excellent means of transport to explore the city while doing physical exercise.",
    "The stars are shining in the night sky and the moon illuminates the path of late walkers.",
    "A good book and a warm blanket are the perfect ingredients for a successful winter evening.",
    "The Sunday market offers fresh fruits and vegetables grown by local farmers.",
    "Taking the time to breathe and reflect is essential to maintain balance in one's life.",
  ],
};

export function getRandomText(lang: "fr" | "en" = "fr"): string {
  const langTexts = typingTexts[lang];
  return langTexts[Math.floor(Math.random() * langTexts.length)];
}
