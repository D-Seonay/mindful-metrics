

# 🎯 Test Suite - Application de Mesure des Performances

Une application web élégante et minimaliste pour tester vos réflexes et votre vitesse de frappe, inspirée du design scandinave et Apple.

---

## 🏠 Page d'Accueil & Navigation

- **Barre de navigation minimaliste** fixe en haut avec deux onglets : "Réflexes" et "Vitesse de Frappe"
- **Bouton de bascule jour/nuit** discret pour passer du thème clair au mode sombre
- Design épuré avec beaucoup d'espace blanc et typographie Inter/moderne
- Transitions fluides entre les pages

---

## ⚡ Module "Test de Réflexes"

**Expérience utilisateur en 4 états :**

1. **État initial** → Conteneur gris/bleu glacier avec "Cliquez pour commencer"
2. **État d'attente** → Fond rouge corail doux, "Attendez le vert..." (clic = échec "Trop tôt !")
3. **État d'action** → Fond vert menthe après 2-5 secondes aléatoires, chrono démarre
4. **État résultat** → Affichage grand format du temps en millisecondes

**Touches visuelles :**
- Transitions de couleur douces entre les états
- Animation "pulse" subtile sur le résultat
- Un clic relance immédiatement le test

---

## ⌨️ Module "Vitesse de Frappe"

**Inspiré de Monkeytype :**

- Affichage centré d'un paragraphe de **30-50 mots aléatoires** (phrases simples du quotidien)
- Saisie directe sans zone de texte visible (autofocus automatique)

**Feedback visuel en temps réel :**
- Lettres non tapées → Gris clair
- Lettres correctes → Gris foncé/noir
- Lettres incorrectes → Rouge vif

**Statistiques affichées en direct :**
- Temps écoulé
- WPM (mots par minute)
- Précision (%)

**Fin du test :**
- Écran de résumé élégant avec WPM final et précision
- Bouton "Recommencer" + raccourci clavier (Tab)

---

## 📊 Historique Local

- Sauvegarde automatique des résultats dans le navigateur (localStorage)
- Section discrète "Historique" accessible pour chaque module
- Affichage des **5-10 derniers résultats** avec date et statistiques
- Indicateur de **meilleur score personnel** (best time / best WPM)

---

## 🎨 Système de Design

**Palette de couleurs :**
- Fond : Blanc cassé / Gris très clair (clair) • Gris anthracite (sombre)
- Accents : Vert menthe (succès), Rouge corail (erreur/attente), Bleu glacier (neutre)

**Typographie :**
- Police sans-serif moderne (Inter ou Geist)
- Résultats en très grande taille, police Bold/ExtraBold
- Excellent contraste et lisibilité

**Micro-interactions :**
- Transitions CSS douces sur tous les changements d'état
- Effet "pulse" subtil sur les résultats
- Curseur de frappe fluide
- Animations légères et réactives

