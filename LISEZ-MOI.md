# Portfolio Monolithe

Site portfolio 3D : 512 modules qui changent de forme à chaque section quand on fait défiler la page (sphère, hélice, onde, anneau, constellation, monolithe).

## Voir le site

WAMP démarré, ouvrez : http://localhost/portfolio/

> Ouvrir `index.html` en double-cliquant ne suffit pas : la 3D a besoin d'un serveur (WAMP, ou n'importe quel hébergeur).

## Mettre votre contenu

Tout se passe dans **`data.js`** : nom, métier, textes, parcours, compétences, projets, documents, contact.

| Quoi | Où déposer le fichier | Dans `data.js` |
|---|---|---|
| Votre photo | `images/portrait.jpg` | `photo` |
| Couverture d'un projet | `images/projets/nom.jpg` | `image` du projet |
| Photos d'un projet | `images/projets/nom-1.jpg`… | `galerie: [ ... ]` |
| CV, diplômes | `documents/cv.pdf`… | `cv` et `documents` |

- Tant qu'une image manque, le site affiche un visuel de remplacement qui indique le chemin attendu.
- Formats conseillés : JPG ou WebP, environ 1600 px de large, moins de 400 Ko.
- Portrait : format vertical (4:5). Couvertures de projet : 4:5. Galerie : 16:10.
- Supprimez `exemple: true` (et remplacez le texte) sur les projets d'exemple.

## Fichiers

- `index.html` : structure de la page
- `style.css` : couleurs, typographie, mise en page (couleurs en haut du fichier)
- `content.js` : remplit la page depuis `data.js`, défilement horizontal, fiche projet
- `scene.js` : la scène 3D (Three.js)

## Mettre en ligne

Copiez tout le dossier `portfolio` sur n'importe quel hébergement web (même statique : Netlify, GitHub Pages, OVH…). Aucune base de données.
