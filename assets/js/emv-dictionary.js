/* ============================================================
   Paiement Décrypté — dictionnaire EMV partagé
   Source unique de vérité pour emv-parser, nexo-config (et les
   prochains outils nexo-acquirer / nexo-retailer).

   Ce fichier ne contient QUE des données (AID, tags, bitfields,
   codes ISO) — aucune logique de rendu. Chaque outil charge ce
   fichier via <script src="…/assets/js/emv-dictionary.js"></script>
   AVANT son propre <script>, et lit les constantes globales
   ci-dessous (EMV_TAGS, TERMCAP_BITS, etc.) directement — les
   `const` de premier niveau d'un <script> classique sont visibles
   depuis les <script> suivants du même document.

   Historique : extrait tel quel d'emv-parser-v4.html (P1, l'outil
   ne redéfinit plus ces tables en local) le jour où nexo-config a
   eu besoin de TERMCAP_BITS (9F33) sans dupliquer la table.
   ATC_BITS (9F40) est ajouté ici en même temps : il a été sourcé
   pour nexo-config puis rapatrié ici pour qu'emv-parser en profite
   aussi (voir wiring dans emv-parser-v4.html, case 'termcap-add').

   Sources : EMV 4.3 Book 3 (définitions de tags, TVR/TSI/CID,
   Terminal Action Analysis), EMV 4.3 Book 4 Annexe A2/A3 (Terminal
   Capabilities, Additional Terminal Capabilities), EMV Contactless
   Book C-2 Kernel 2 (qualificateurs TTQ/CTQ), connaissances
   publiques (AID réseaux), tables ISO 4217/3166-1 (pycountry +
   Babel/CLDR). Aucune donnée réelle : tous les exemples sont
   synthétiques.
   ============================================================ */

const EMV_AIDS = {
  'A0000000031010': { reseau: 'Visa', produit: 'Visa crédit/débit' },
  'A0000000032010': { reseau: 'Visa', produit: 'Visa Electron' },
  'A0000000032020': { reseau: 'Visa', produit: 'V PAY' },
  'A0000000041010': { reseau: 'Mastercard', produit: 'Mastercard crédit/débit' },
  'A0000000043060': { reseau: 'Mastercard', produit: 'Maestro' },
  'A0000000250104': { reseau: 'American Express', produit: 'Amex' },
  'A00000002501':   { reseau: 'American Express', produit: 'Amex' },
  'A0000000421010': { reseau: 'CB', produit: 'CB (Cartes Bancaires), crédit/débit', fr: true },
  'A0000000422010': { reseau: 'CB', produit: 'CB (Cartes Bancaires), débit', fr: true },
  'A0000001523010': { reseau: 'Discover', produit: 'Discover/Diners' },
  'A0000003330101': { reseau: 'UnionPay', produit: 'UnionPay débit' },
  'A0000003330102': { reseau: 'UnionPay', produit: 'UnionPay crédit' },
  'A0000000651010': { reseau: 'JCB', produit: 'JCB' },
};

const DF_NAMES = {
  '315041592E5359532E4444463031': 'PSE, « 1PAY.SYS.DDF01 » (sélection contact)',
  '325041592E5359532E4444463031': 'PPSE, « 2PAY.SYS.DDF01 » (sélection sans contact)',
};

const COUNTRY_CODES = { '0250': 'France', '0840': 'États-Unis', '0826': 'Royaume-Uni', '0276': 'Allemagne', '0056': 'Belgique', '0724': 'Espagne', '0380': 'Italie', '0756': 'Suisse', '0442': 'Luxembourg', '0620': 'Portugal', '0528': 'Pays-Bas' };
const CURRENCY_CODES = { '0978': 'EUR (euro)', '0840': 'USD (dollar US)', '0826': 'GBP (livre sterling)', '0756': 'CHF (franc suisse)', '0392': 'JPY (yen)' };

/* ---------- Bitfields ---------- */
/* Chaque entrée : [octet (1-based), masque, libellé, gravité]
   gravité : 'info' | 'warn' | 'bad', pilote la couleur et la narration */

const TVR_BITS = [
  [1,0x80,"Authentification offline des données non réalisée",'warn'],
  [1,0x40,"Échec SDA (authentification statique)",'bad'],
  [1,0x20,"Données ICC manquantes",'warn'],
  [1,0x10,"Carte présente dans la liste d'exception du terminal",'bad'],
  [1,0x08,"Échec DDA (authentification dynamique)",'bad'],
  [1,0x04,"Échec CDA (authentification combinée)",'bad'],
  [2,0x80,"Versions d'application carte/terminal différentes",'info'],
  [2,0x40,"Application expirée",'bad'],
  [2,0x20,"Application pas encore active (date d'effet future)",'warn'],
  [2,0x10,"Service demandé non autorisé pour ce produit carte",'warn'],
  [2,0x08,"Carte neuve (première utilisation)",'info'],
  [3,0x80,"Vérification du porteur non réussie",'bad'],
  [3,0x40,"CVM non reconnu",'warn'],
  [3,0x20,"Nombre d'essais PIN dépassé",'bad'],
  [3,0x10,"PIN requis mais clavier PIN absent ou HS",'warn'],
  [3,0x08,"PIN requis, clavier présent, mais PIN non saisi",'warn'],
  [3,0x04,"PIN en ligne saisi",'info'],
  [4,0x80,"Montant au-dessus du plancher (floor limit)",'info'],
  [4,0x40,"Limite basse d'offline consécutifs dépassée",'warn'],
  [4,0x20,"Limite haute d'offline consécutifs dépassée",'warn'],
  [4,0x10,"Transaction tirée au sort pour passage en ligne",'info'],
  [4,0x08,"Commerçant a forcé le passage en ligne",'info'],
  [5,0x80,"TDOL par défaut utilisé",'info'],
  [5,0x40,"Échec de l'authentification émetteur",'bad'],
  [5,0x20,"Échec script émetteur avant le GENERATE AC final",'warn'],
  [5,0x10,"Échec script émetteur après le GENERATE AC final",'warn'],
];

const AIP_BITS = [
  [1,0x40,"SDA supportée (authentification statique)",'info'],
  [1,0x20,"DDA supportée (authentification dynamique)",'info'],
  [1,0x10,"Vérification du porteur supportée (CVM)",'info'],
  [1,0x08,"Gestion de risque terminal à effectuer",'info'],
  [1,0x04,"Authentification émetteur supportée",'info'],
  [1,0x02,"Vérification porteur sur l'appareil (CDCVM) supportée",'info'],
  [1,0x01,"CDA supportée (authentification combinée)",'info'],
  [2,0x80,"Mode MSD supporté (sans contact, héritage)",'info'],
  [2,0x02,"Protocole de résistance au relais supporté (sans contact, Kernel 2)",'info'],
];

const TSI_BITS = [
  [1,0x80,"Authentification offline des données effectuée",'info'],
  [1,0x40,"Vérification du porteur effectuée",'info'],
  [1,0x20,"Gestion de risque carte effectuée",'info'],
  [1,0x10,"Authentification émetteur effectuée",'info'],
  [1,0x08,"Gestion de risque terminal effectuée",'info'],
  [1,0x04,"Traitement de script émetteur effectué",'info'],
];


const TERMCAP_BITS = [
  [1,0x80,"Saisie manuelle (clavier terminal)",'info'],
  [1,0x40,"Lecture piste magnétique",'info'],
  [1,0x20,"Lecture puce avec contact",'info'],
  [2,0x80,"PIN offline en clair vérifié par la carte",'info'],
  [2,0x40,"PIN chiffré vérifié en ligne",'info'],
  [2,0x20,"Signature manuscrite (papier)",'info'],
  [2,0x10,"PIN offline chiffré vérifié par la carte",'info'],
  [2,0x08,"Aucun CVM requis (no CVM)",'info'],
  [3,0x80,"Authentification statique (SDA)",'info'],
  [3,0x40,"Authentification dynamique (DDA)",'info'],
  [3,0x20,"Capture de carte possible",'info'],
  [3,0x08,"Authentification combinée (CDA)",'info'],
];

const ATC_BITS = [ // tag 9F40, Additional Terminal Capabilities — EMV 4.3 Book 4, Annexe A3, Tables 28-32
  [1,0x80,"Cash",'info'], [1,0x40,"Goods",'info'], [1,0x20,"Services",'info'], [1,0x10,"Cashback",'info'],
  [1,0x08,"Inquiry",'info'], [1,0x04,"Transfer",'info'], [1,0x02,"Payment",'info'], [1,0x01,"Administrative",'info'],
  [2,0x80,"Cash Deposit",'info'],
  [3,0x80,"Numeric keys",'info'], [3,0x40,"Alphabetic and special characters keys",'info'],
  [3,0x20,"Command keys",'info'], [3,0x10,"Function keys",'info'],
  [4,0x80,"Print, attendant",'info'], [4,0x40,"Print, cardholder",'info'],
  [4,0x20,"Display, attendant",'info'], [4,0x10,"Display, cardholder",'info'],
  [4,0x02,"Code table 10",'info'], [4,0x01,"Code table 9",'info'],
  [5,0x80,"Code table 8",'info'], [5,0x40,"Code table 7",'info'], [5,0x20,"Code table 6",'info'],
  [5,0x10,"Code table 5",'info'], [5,0x08,"Code table 4",'info'], [5,0x04,"Code table 3",'info'],
  [5,0x02,"Code table 2",'info'], [5,0x01,"Code table 1",'info'],
];

const CVM_CODES = {
  0x00: "Échec du CVM (fail CVM processing)",
  0x01: "PIN offline en clair, vérifié par la carte",
  0x02: "PIN en ligne (vérifié par l'émetteur)",
  0x03: "PIN offline en clair + signature papier",
  0x04: "PIN offline chiffré, vérifié par la carte",
  0x05: "PIN offline chiffré + signature papier",
  0x1E: "Signature papier",
  0x1F: "Aucun CVM requis (no CVM required)",
  0x3F: "Aucun CVM exécuté (no CVM performed)",
};

const CVM_CONDITIONS = {
  0x00: "Toujours",
  0x01: "Si retrait sans surveillance (unattended cash)",
  0x02: "Si ni retrait sans surveillance, ni cash manuel, ni achat avec cash-back",
  0x03: "Si le terminal supporte cette méthode CVM",
  0x04: "Si cash manuel",
  0x05: "Si achat avec cash-back",
  0x06: "Si montant (devise application) inférieur à la valeur X",
  0x07: "Si montant (devise application) supérieur à la valeur X",
  0x08: "Si montant (devise application) inférieur à la valeur Y",
  0x09: "Si montant (devise application) supérieur à la valeur Y",
};

const CVM_RESULTS = { 0x00: "Inconnu (ex. signature : le terminal ne sait pas)", 0x01: "Échec", 0x02: "Réussi" };

const ARC_CODES = {
  '00': { txt: "Approbation", ok: true },
  '01': { txt: "Référez-vous à l'émetteur (appel)", ok: false },
  '02': { txt: "Référez-vous à l'émetteur, conditions spéciales", ok: false },
  '05': { txt: "Refus (do not honour)", ok: false },
  '51': { txt: "Provision insuffisante", ok: false },
  '54': { txt: "Carte expirée", ok: false },
  '55': { txt: "PIN incorrect", ok: false },
  'Y1': { txt: "Approbation offline (la transaction n'est pas allée en ligne)", ok: true },
  'Z1': { txt: "Refus offline", ok: false },
  'Y3': { txt: "Passage en ligne impossible, approbation offline", ok: true },
  'Z3': { txt: "Passage en ligne impossible, refus offline", ok: false },
};

/* ---------- Dictionnaire de tags ----------
   n = nom, cat = catégorie, p = explication pédagogique,
   ep = épisode lié {label, href|null}, dec = décodeur spécial */

const EP_RESEAUX = { label: "S1E01 · Visa, Mastercard, CB : à quoi sert un réseau ?", href: "/episodes/s1e01.html" };
const EP_AUTORISATION = { label: "S1E07 · L'autorisation (à venir)", href: null };

const EMV_TAGS = {
  '4F': { n: "AID, identifiant d'application", cat: "Identification", dec: 'aid', ep: EP_RESEAUX,
    p: "L'AID identifie l'application de paiement sur la puce : les 5 premiers octets (RID) désignent le réseau (Visa, Mastercard, CB…), la suite précise le produit. Une carte co-badgée française porte typiquement deux AID : CB et Visa ou Mastercard." },
  '50': { n: "Application Label", cat: "Identification", dec: 'text',
    p: "Le nom de l'application tel que la carte le propose à l'affichage (ex. « CB », « VISA »). C'est ce libellé qu'un terminal affiche quand il demande au client de choisir entre les marques d'une carte co-badgée." },
  '57': { n: "Track 2 Equivalent Data", cat: "Identification", dec: 'track2',
    p: "Reprend les données de l'ancienne piste magnétique : PAN, date d'expiration, service code. Séparateur « D ». Présent pour compatibilité avec les systèmes hérités, c'est une donnée sensible (PCI) : ne collez jamais une vraie capture ici." },
  '5A': { n: "PAN, numéro de carte", cat: "Identification", dec: 'pan',
    p: "Le numéro de carte encodé en BCD. Donnée sensible PCI : dans les logs et outils, il doit toujours être masqué ou tronqué (6 premiers + 4 derniers chiffres au maximum)." },
  '5F20': { n: "Cardholder Name", cat: "Identification", dec: 'text',
    p: "Nom du porteur tel qu'embossé. Souvent rempli de valeurs génériques sur les cartes récentes (« / » ou espaces) pour limiter l'exposition de données personnelles." },
  '5F24': { n: "Application Expiration Date", cat: "Identification", dec: 'date',
    p: "Date d'expiration de l'application (AAMMJJ). C'est elle que le terminal compare à la date du jour, le bit « application expirée » du TVR vient de ce contrôle." },
  '5F25': { n: "Application Effective Date", cat: "Identification", dec: 'date',
    p: "Date de début de validité (AAMMJJ). Une carte utilisée avant cette date déclenche le bit « application pas encore active » du TVR." },
  '5F28': { n: "Issuer Country Code", cat: "Identification", dec: 'country',
    p: "Pays de la banque émettrice (ISO 3166 numérique). Sert notamment à distinguer transaction domestique et internationale, ce qui change les règles d'interchange et de routage." },
  '5F2A': { n: "Transaction Currency Code", cat: "Transaction", dec: 'currency',
    p: "Devise de la transaction (ISO 4217 numérique). 0978 = euro. Si elle diffère de la devise de la carte, on entre dans le territoire du change dynamique (DCC)." },
  '5F2D': { n: "Language Preference", cat: "Identification", dec: 'text',
    p: "Langues préférées du porteur (codes ISO 639), par ordre de préférence. C'est grâce à ce tag qu'un terminal affiche « SAISISSEZ VOTRE CODE » plutôt que « ENTER PIN » à un porteur français." },
  '5F34': { n: "PAN Sequence Number", cat: "Identification",
    p: "Distingue plusieurs cartes portant le même PAN (renouvellement, carte principale/secondaire). Indispensable côté émetteur pour retrouver les bonnes clés cryptographiques de la carte." },
  '61': { n: "Application Template", cat: "Structure", constructed: true, ep: EP_RESEAUX,
    p: "Conteneur d'une entrée de répertoire : une application candidate (AID + libellé + priorité). Dans une PPSE de carte co-badgée, vous verrez deux templates 61, un par marque. L'ordre et le tag 87 décident de la priorité." },
  '6F': { n: "FCI Template, réponse à SELECT", cat: "Structure", constructed: true,
    p: "La réponse de la carte à une commande SELECT : elle annonce le fichier sélectionné (84) et ses métadonnées (A5). C'est le point de départ de toute transaction EMV." },
  '70': { n: "Record Template", cat: "Structure", constructed: true,
    p: "Enveloppe générique des enregistrements lus par READ RECORD : les données applicatives de la carte (PAN, dates, listes CVM, certificats…) vivent dans ces enregistrements." },
  '77': { n: "Response Template Format 2", cat: "Structure", constructed: true,
    p: "Format de réponse en TLV explicites, typiquement la réponse à GENERATE AC : cryptogramme (9F26), type de cryptogramme (9F27), ATC (9F36), IAD (9F10)." },
  '80': { n: "Response Template Format 1", cat: "Structure",
    p: "Format de réponse compact : les valeurs sont concaténées SANS structure TLV, dans un ordre imposé par la commande. Piège classique de débutant : il ne se parse pas comme du TLV, l'ordre vient de la spec." },
  '82': { n: "AIP, Application Interchange Profile", cat: "Décision", dec: 'aip',
    p: "La carte annonce ici ce qu'elle sait faire : quelles authentifications offline (SDA/DDA/CDA), si elle supporte la vérification porteur, l'authentification émetteur… Le terminal adapte toute la transaction à ce profil. 2 octets de bits." },
  '84': { n: "DF Name, nom du fichier sélectionné", cat: "Identification", dec: 'dfname', ep: EP_RESEAUX,
    p: "Nom du répertoire ou de l'application sélectionnée. « 2PAY.SYS.DDF01 » = répertoire de sélection sans contact (PPSE) ; sinon, c'est en général l'AID de l'application élue." },
  '87': { n: "Application Priority Indicator", cat: "Identification",
    p: "Un octet qui règle deux choses dans le répertoire des applications (chaque application candidate y est listée dans un gabarit Application Template, tag 61) : le bit de poids fort (b8) indique si une confirmation explicite du porteur est exigée avant de sélectionner cette application (1 = oui) ; les 4 bits de poids faible donnent le rang de priorité, de 1 (le plus prioritaire) à 15, la valeur 0 signifiant que l'émetteur n'exprime aucune préférence entre plusieurs applications. Sur une carte co-badgée en France, le commerçant peut configurer sa préférence d'affichage mais le client garde le droit de choisir la marque (règlement IFR, art. 8)." },
  '88': { n: "SFI, Short File Identifier", cat: "Structure",
    p: "Identifiant court du fichier où lire les enregistrements du répertoire. Détail de plomberie de la sélection d'application, utile quand on déroule un SELECT PSE à la main." },
  '8A': { n: "ARC, Authorisation Response Code", cat: "Décision", dec: 'arc', ep: EP_AUTORISATION,
    p: "Le verdict du circuit d'autorisation, sur 2 caractères : 00 = approbation, 05 = refus… Les codes Y1/Z1/Y3/Z3 sont générés par le terminal lui-même quand la transaction se décide offline. À ne pas confondre avec le cryptogramme : l'ARC est le verdict, le cryptogramme est la preuve." },
  '8C': { n: "CDOL1, Card Risk Management DOL 1", cat: "Décision", dec: 'dol',
    p: "La liste de courses de la carte pour le premier GENERATE AC : quels tags terminal (montant, TVR, date, nonce…) elle exige, dans quel ordre. Le terminal les concatène SANS tags, c'est pour ça qu'on ne peut pas parser une CDOL data comme du TLV." },
  '8D': { n: "CDOL2, Card Risk Management DOL 2", cat: "Décision", dec: 'dol',
    p: "Même principe que CDOL1, pour le second GENERATE AC (après retour de l'autorisation en ligne) : la carte y demande typiquement l'ARC et les résultats d'authentification émetteur." },
  '8E': { n: "CVM List, liste des méthodes de vérification", cat: "Porteur", dec: 'cvmlist',
    p: "La politique de vérification du porteur, écrite par l'émetteur dans la carte : une suite de règles « méthode + condition » évaluées dans l'ordre. Exemple type en France : PIN offline chiffré, sinon PIN en ligne, sinon signature." },
  '8F': { n: "CA Public Key Index", cat: "Sécurité",
    p: "Index de la clé publique de l'autorité de certification (par réseau) que le terminal doit utiliser pour remonter la chaîne de certificats. Si le terminal n'a pas cette clé en stock, l'authentification offline échoue, bit TVR correspondant." },
  '90': { n: "Issuer Public Key Certificate", cat: "Sécurité",
    p: "Certificat de la clé publique émetteur, signé par la CA du réseau. Premier maillon de la chaîne de confiance offline : CA → émetteur → carte." },
  '92': { n: "Issuer Public Key Remainder", cat: "Sécurité",
    p: "Reste de la clé publique émetteur qui ne tenait pas dans le certificat 90. Se concatène pour reconstituer la clé complète." },
  '93': { n: "Signed Static Application Data", cat: "Sécurité",
    p: "Les données statiques de la carte signées par l'émetteur, le cœur de la SDA. Faible par conception (rejouable) : c'est pourquoi SDA a disparu au profit de DDA/CDA." },
  '94': { n: "AFL, Application File Locator", cat: "Structure", dec: 'afl',
    p: "La carte indique au terminal quels enregistrements lire (fichier, plage, et lesquels participent à l'authentification offline). Se lit par groupes de 4 octets : SFI, premier enregistrement, dernier, nombre d'enregistrements signés." },
  '95': { n: "TVR, Terminal Verification Results", cat: "Décision", dec: 'tvr', ep: EP_AUTORISATION,
    p: "Le carnet de bord du terminal : 5 octets de bits, chacun notant un contrôle qui a échoué ou un événement (authentification ratée, carte expirée, plafond dépassé…). Croisé avec les seuils TAC/IAC, c'est LUI qui décide si la transaction passe offline, part en ligne ou est refusée. Le tag le plus précieux d'un log de transaction." },
  '9A': { n: "Transaction Date", cat: "Transaction", dec: 'date',
    p: "Date de la transaction côté terminal (AAMMJJ). Entre dans le calcul du cryptogramme, une date incohérente et le cryptogramme ne se vérifie plus." },
  '9B': { n: "TSI, Transaction Status Information", cat: "Décision", dec: 'tsi',
    p: "Complément du TVR : quelles étapes ont été TENTÉES (authentification, vérification porteur, scripts…). Le TVR dit « ce qui a mal tourné », le TSI dit « ce qui a été fait ». Les deux se lisent ensemble." },
  '9C': { n: "Transaction Type", cat: "Transaction", dec: 'txtype',
    p: "Type d'opération (ISO 8583 processing code) : 00 = achat, 01 = retrait, 09 = achat avec cash-back, 20 = remboursement…" },
  '9F02': { n: "Amount, Authorised", cat: "Transaction", dec: 'amount',
    p: "Le montant de la transaction en BCD, dans la plus petite unité de la devise (centimes pour l'euro). 000000010000 = 100,00. Le montant fait partie des données signées dans le cryptogramme." },
  '9F03': { n: "Amount, Other", cat: "Transaction", dec: 'amount',
    p: "Un second montant, distinct du montant principal (9F02), dont le sens exact dépend du contexte terminal/émetteur : le plus souvent un cash-back, mais aussi parfois des frais de service ou un pourboire. Zéro dans l'immense majorité des transactions françaises." },
  '9F06': { n: "AID (terminal)", cat: "Identification", dec: 'aid', ep: EP_RESEAUX,
    p: "L'AID vu côté terminal (pendant la sélection). Même sémantique que le tag 4F côté carte." },
  '9F07': { n: "Application Usage Control", cat: "Décision",
    p: "Restrictions d'usage posées par l'émetteur : carte valable à l'étranger ? aux distributeurs ? pour du cash-back ? Le terminal les confronte au contexte, un usage interdit allume le bit « service non autorisé » du TVR." },
  '9F08': { n: "Application Version Number (carte)", cat: "Identification",
    p: "Version de la spec applicative supportée par la carte. Comparée à celle du terminal (9F09), un écart allume un bit TVR, généralement sans conséquence bloquante." },
  '9F09': { n: "Application Version Number (terminal)", cat: "Terminal",
    p: "Version de la spec applicative côté kernel du terminal." },
  '9F0D': { n: "IAC, Default", cat: "Décision", dec: 'iac',
    p: "Seuils de l'émetteur, plan B : si la transaction devait partir en ligne mais que le terminal ne peut pas (hors ligne), ces bits disent quoi refuser. Se lit comme un masque appliqué au TVR." },
  '9F0E': { n: "IAC, Denial", cat: "Décision", dec: 'iac',
    p: "Seuils de l'émetteur, refus sec : tout bit commun entre ce masque et le TVR = refus offline immédiat, sans même tenter le passage en ligne. Un émetteur prudent y met par exemple « carte expirée »." },
  '9F0F': { n: "IAC, Online", cat: "Décision", dec: 'iac',
    p: "Seuils de l'émetteur, passage en ligne : tout bit commun avec le TVR envoie la transaction en autorisation en ligne. En France, la quasi-totalité des transactions partent en ligne de toute façon, ces masques comptent surtout là où l'offline est fréquent." },
  '9F10': { n: "IAD, Issuer Application Data", cat: "Sécurité",
    p: "Données propriétaires de l'émetteur renvoyées avec le cryptogramme : résultats de la gestion de risque carte (CVR), compteurs internes… Le format exact dépend du réseau et du profil applicatif, c'est le tag le plus « boîte noire » d'une réponse GENERATE AC." },
  '9F12': { n: "Application Preferred Name", cat: "Identification", dec: 'text',
    p: "Nom d'affichage préféré de l'application, éventuellement dans un jeu de caractères dédié (9F11). Prend le pas sur le tag 50 si le terminal sait l'afficher." },
  '9F1A': { n: "Terminal Country Code", cat: "Terminal", dec: 'country',
    p: "Pays du terminal (ISO 3166). Comparé au pays émetteur (5F28) pour déterminer domestique vs international." },
  '9F1E': { n: "IFD Serial Number", cat: "Terminal", dec: 'text',
    p: "Numéro de série du lecteur. Identifie physiquement l'appareil dans les logs, donnée à anonymiser avant tout partage de capture." },
  '9F26': { n: "AC, Application Cryptogram", cat: "Sécurité",
    p: "LA preuve cryptographique de la transaction : un MAC calculé par la puce avec ses clés secrètes. La liste exacte des données qui entrent dans ce calcul n'est pas fixe : c'est la carte elle-même qui la choisit, transaction par transaction, via les tags CDOL1 (8C) et CDOL2 (8D), inclut presque toujours le montant, la date et le TVR. Dans un flux qui contient un 8C ou un 8D, ouvrez-le : vous verrez la liste exacte demandée par cette carte pour ce cryptogramme. Infalsifiable sans la clé de la carte, l'émetteur le vérifie pour authentifier la transaction. Son type (ARQC/TC/AAC) est donné par le tag 9F27." },
  '9F27': { n: "CID, Cryptogram Information Data", cat: "Décision", dec: 'cid', ep: EP_AUTORISATION,
    p: "Le type de cryptogramme rendu par la carte, donc sa décision : AAC = refus, TC = approbation offline, ARQC = « demandez à l'émetteur ». La carte peut être plus stricte que le terminal, jamais plus laxiste." },
  '9F32': { n: "Issuer Public Key Exponent", cat: "Sécurité",
    p: "Exposant public de la clé émetteur (3 ou 65537). Avec le certificat 90 et le reste 92, il permet de reconstituer la clé publique complète." },
  '9F33': { n: "Terminal Capabilities", cat: "Terminal", dec: 'termcap',
    p: "Ce que le terminal sait faire, sur 3 octets : modes de saisie carte, CVM supportés, authentifications offline. Un distributeur automatique et un TPE de restaurant n'ont pas le même profil." },
  '9F34': { n: "CVM Results", cat: "Porteur", dec: 'cvmres',
    p: "Le résultat de la vérification du porteur : quelle méthode a été appliquée (issue de la CVM List 8E), sous quelle condition, et si elle a réussi. Complément indispensable du TVR pour comprendre un refus lié au PIN." },
  '9F35': { n: "Terminal Type", cat: "Terminal", dec: 'termtype',
    p: "Un code à 2 chiffres qui croise deux axes : qui contrôle le terminal (institution financière, commerçant, porteur) et son environnement (avec opérateur ou non, capacité à passer en ligne). La très grande majorité des TPE commerçants attended en France sont dans la tranche 21-23 ; la valeur exacte selon la capacité offline dépend du contrat acquéreur." },
  '9F36': { n: "ATC, Application Transaction Counter", cat: "Sécurité", dec: 'counter',
    p: "Compteur incrémenté par la puce à chaque transaction. Il empêche qu'une transaction interceptée soit réutilisée telle quelle : comme il entre dans le calcul du cryptogramme, deux transactions ne produisent jamais le même. Un saut anormal d'ATC est un signal de fraude côté émetteur." },
  '9F37': { n: "Unpredictable Number", cat: "Sécurité",
    p: "Le nonce du terminal : un aléa injecté dans le calcul du cryptogramme pour empêcher le pré-calcul et le rejeu. Une UN prévisible a déjà cassé la sécurité de terminaux entiers, c'est un point d'audit classique." },
  '9F38': { n: "PDOL, Processing Options DOL", cat: "Structure", dec: 'dol',
    p: "La liste des données terminal que la carte veut recevoir dès le GET PROCESSING OPTIONS. Même logique que les CDOL : des références de tags, les valeurs voyagent ensuite sans structure." },
  '9F42': { n: "Application Currency Code", cat: "Identification", dec: 'currency',
    p: "Devise de référence de l'application carte (celle des compteurs offline internes)." },
  '9F44': { n: "Application Currency Exponent", cat: "Identification",
    p: "Position du séparateur décimal pour la devise de l'application (2 pour l'euro)." },
  '9F45': { n: "Data Authentication Code", cat: "Sécurité",
    p: "Code produit par l'authentification SDA, mémorisé pour les DOL. Héritage, rare sur les cartes modernes." },
  '9F46': { n: "ICC Public Key Certificate", cat: "Sécurité",
    p: "Certificat de la clé publique de la carte, signé par l'émetteur. Dernier maillon de la chaîne CA → émetteur → carte, utilisé par DDA/CDA." },
  '9F47': { n: "ICC Public Key Exponent", cat: "Sécurité",
    p: "Exposant public de la clé de la carte." },
  '9F48': { n: "ICC Public Key Remainder", cat: "Sécurité",
    p: "Reste de la clé publique carte ne tenant pas dans le certificat 9F46." },
  '9F4A': { n: "SDA Tag List", cat: "Sécurité",
    p: "Liste des tags supplémentaires inclus dans les données signées statiquement, en pratique presque toujours l'AIP (82), pour empêcher sa falsification." },
  '9F4B': { n: "Signed Dynamic Application Data", cat: "Sécurité",
    p: "La signature dynamique produite par la carte lors d'une DDA/CDA : elle couvre notamment le nonce du terminal, prouvant que la carte est vivante et présente, ce que SDA ne prouvait pas." },
  '9F66': { n: "TTQ, Terminal Transaction Qualifiers", cat: "Terminal", dec: 'ttq',
    p: "En sans contact : le terminal annonce à la carte ce qu'il supporte et exige (mode EMV, PIN en ligne, signature, CDCVM…). C'est la première négociation d'un tap." },
  '9F6C': { n: "CTQ, Card Transaction Qualifiers", cat: "Décision",
    p: "La réponse de la carte au TTQ en sans contact : ses exigences à elle (demander le PIN en ligne, basculer en contact…)." },
  '71': { n: "Issuer Script Template 1", cat: "Sécurité",
    p: "Commande envoyée par l'émetteur à la carte via le terminal, exécutée avant le GENERATE AC final : bloquer l'application, remettre à zéro le compteur PIN… C'est le canal de gestion à distance des cartes." },
  '72': { n: "Issuer Script Template 2", cat: "Sécurité",
    p: "Même principe que le tag 71, mais exécuté après le GENERATE AC final." },
  '91': { n: "Issuer Authentication Data", cat: "Sécurité",
    p: "Données renvoyées par l'émetteur (ARPC + code) permettant à la carte de vérifier que la réponse d'autorisation vient bien de lui, l'authentification dans l'autre sens." },
  '97': { n: "TDOL, Transaction Certificate DOL", cat: "Structure", dec: 'dol',
    p: "Liste des données à inclure dans le calcul du TC Hash. Rare en pratique, d'où le bit TVR « TDOL par défaut utilisé »." },
  '98': { n: "TC Hash Value", cat: "Sécurité",
    p: "Empreinte des données de transaction, peu utilisée dans les déploiements modernes." },
  '99': { n: "Transaction PIN Data", cat: "Porteur",
    p: "Le PIN chiffré en transit vers la carte pour vérification offline. Ne doit JAMAIS apparaître en clair dans un log." },
  '9D': { n: "DDF Name", cat: "Structure",
    p: "Nom d'un fichier de répertoire pour la sélection par annuaire (méthode PSE historique)." },
  '9F21': { n: "Transaction Time", cat: "Transaction",
    p: "Heure locale de la transaction (HHMMSS), complément du tag 9A." },
  '9F24': { n: "PAR, Payment Account Reference", cat: "Identification", dec: 'text',
    p: "Identifiant non sensible (jusqu'à 29 caractères alphanumériques) qui relie un PAN tokenisé (wallet mobile, carte virtuelle) à son PAN d'origine, sans jamais exposer ce dernier. Un même PAR reste stable pour tous les tokens issus de la même carte physique, ce qui permet de rapprocher paiement en carte physique et paiement en wallet côté commerçant ou émetteur sans aucun risque PCI." },
  '9F40': { n: "Additional Terminal Capabilities", cat: "Terminal", dec: 'termcap-add',
    p: "Complément du tag 9F33 : types de transactions supportés (cash, achat, retrait…) et capacités d'affichage/saisie du terminal." },
  '9F41': { n: "Transaction Sequence Counter", cat: "Transaction", dec: 'counter',
    p: "Compteur de transactions côté terminal, le pendant terminal de l'ATC carte." },
  '5F36': { n: "Transaction Currency Exponent", cat: "Transaction",
    p: "Nombre de décimales de la devise de transaction (2 pour l'euro : les montants circulent en centimes)." },
  '5F30': { n: "Service Code", cat: "Identification",
    p: "Code service hérité des pistes magnétiques (ISO/IEC 7813) : conditions d'interchange, restrictions d'autorisation, exigences PIN. La puce a ses propres contrôles, mais ce code reste lu par les systèmes hérités." },
  '9F0A': { n: "ASRPD, Application Selection Registered Proprietary Data", cat: "Identification",
    p: "Identifiant enregistré auprès d'EMVCo (Spec Bulletin 175) permettant à un marché ou un émetteur d'exposer une fonctionnalité propriétaire pendant la sélection d'application. Le contenu dépend de l'entité qui a enregistré l'ID, non décodable sans sa documentation." },
  '9F6E': { n: "FFI, Form Factor Indicator", cat: "Terminal", dec: 'ffi',
    p: "Hors norme EMV de base : sa signification dépend du réseau. Chez Visa, c'est le Form Factor Indicator, 4 octets qui décrivent le support de paiement (carte, mobile, objet connecté…) et ses capacités. Chez Mastercard, le même tag porte le Third Party Data, un format à longueur variable (pays, identifiant, type de support). L'outil détecte le format à la longueur de la valeur et décode les deux." },
  'A5': { n: "FCI Proprietary Template", cat: "Structure", constructed: true,
    p: "La partie « métadonnées » de la réponse SELECT : libellés, priorité, PDOL, données propriétaires (BF0C). C'est ici qu'une carte co-badgée liste ses applications." },
  'BF0C': { n: "FCI Issuer Discretionary Data", cat: "Structure", constructed: true,
    p: "Zone discrétionnaire de l'émetteur dans la FCI, les entrées de répertoire (61) y logent, ainsi que des tags propriétaires réseau ou domestiques (dont certains tags CB non publiés)." },
};

/* Une phrase de contexte par catégorie, affichée en info-bulle sur le badge
   (feedback : le badge seul, sans définition, n'apprend rien) */
const CAT_HELP = {
  "Identification": "Identifie la carte, l'application ou le porteur (PAN, AID, libellés…).",
  "Structure": "Organise les données EMV (conteneurs TLV, gabarits de réponse), sans porter de sens métier.",
  "Transaction": "Décrit l'opération en cours : montant, devise, date, type.",
  "Décision": "Pilote ou révèle une décision de la transaction (offline, en ligne, refus).",
  "Porteur": "Concerne la vérification du porteur : PIN, signature, biométrie.",
  "Sécurité": "Sert à l'authentification cryptographique : clés, certificats, cryptogrammes.",
  "Terminal": "Décrit les capacités ou réglages du terminal, pas de la carte.",
};

/* Références de sourcing par tag (axe "dictionnaire sourcé") */
const TAG_REFS = {
  '87': "EMV 4.3 Book 1, §11.3.4",
  '9F24': "EMVCo, Payment Account Reference (PAR), spécification publique désormais gérée par les réseaux",
  '82': "EMV 4.3 Book 3, Annexe C1 (+ Book C-2 Kernel 2 pour l'octet 2)",
  '95': "EMV 4.3 Book 3, Annexe C5",
  '9B': "EMV 4.3 Book 3, Annexe C6",
  '8E': "EMV 4.3 Book 3, Annexe C3",
  '9F34': "EMV 4.3 Book 3, Annexe C3 (CVM Results)",
  '9F33': "EMV 4.3 Book 4, Annexe A2",
  '9F40': "EMV 4.3 Book 4, Annexe A3",
  '9F27': "EMV 4.3 Book 3, §6.5.5 (CID)",
  '9F0D': "EMV 4.3 Book 3, §10.7 (Terminal Action Analysis)",
  '9F0E': "EMV 4.3 Book 3, §10.7 (Terminal Action Analysis)",
  '9F0F': "EMV 4.3 Book 3, §10.7 (Terminal Action Analysis)",
  '5F2A': "ISO 4217 numérique (table générée pycountry/CLDR)",
  '9F42': "ISO 4217 numérique (table générée pycountry/CLDR)",
  '5F28': "ISO 3166-1 numérique (table générée pycountry/CLDR)",
  '9F1A': "ISO 3166-1 numérique (table générée pycountry/CLDR)",
  '9F66': "Specs sans contact EMVCo (Book A / Entry Point)",
  '9F6E': "Hors norme de base, usage réseau : Visa Payment Technology Standards Manual (FFI) et documentation Mastercard M/Chip (Third Party Data), sources publiques",
  '9F0A': "EMVCo Specification Bulletin 175 (ASRPD)",
  '5F30': "ISO/IEC 7813 (pistes magnétiques)",
};

/* Types de transaction (9C) */
const TX_TYPES = { '00': "Achat", '01': "Retrait / avance de fonds", '09': "Achat avec cash-back", '20': "Remboursement (refund)", '30': "Interrogation de solde", '17': "Retrait espèces au guichet" };

/* Décisions carte possibles (CID, tag 9F27) : le texte passe avant le sigle, sur demande de Charles */
const CID_LABELS = {
  'AAC': "Refus par la carte",
  'TC': "Approbation offline",
  'ARQC': "Demande d'autorisation en ligne",
  'RFU/AAR': "Valeur réservée",
};

/* Terminal Type (9F35), EMV 4.3 Book 4 §12.2 Annexe A1, Table 24 : 2 chiffres, qui contrôle ×
   quel environnement. Vérifié par Charles contre le texte de la spec (extrait fourni le 09/08). */
const TERM_TYPE = {
  '11': "Institution financière, avec opérateur, en ligne uniquement",
  '12': "Institution financière, avec opérateur, hors ligne avec passage en ligne possible",
  '13': "Institution financière, avec opérateur, hors ligne uniquement",
  '14': "Institution financière, sans opérateur, en ligne uniquement",
  '15': "Institution financière, sans opérateur, hors ligne avec passage en ligne possible",
  '16': "Institution financière, sans opérateur, hors ligne uniquement",
  '21': "Commerçant, avec opérateur, en ligne uniquement",
  '22': "Commerçant, avec opérateur, hors ligne avec passage en ligne possible",
  '23': "Commerçant, avec opérateur, hors ligne uniquement",
  '24': "Commerçant, sans opérateur (libre-service), en ligne uniquement",
  '25': "Commerçant, sans opérateur (libre-service), hors ligne avec passage en ligne possible",
  '26': "Commerçant, sans opérateur (libre-service), hors ligne uniquement",
  '34': "Porteur, terminal personnel, en ligne uniquement",
  '35': "Porteur, terminal personnel, hors ligne avec passage en ligne possible",
  '36': "Porteur, terminal personnel, hors ligne uniquement",
};

/* Form Factor Indicator (9F6E), Visa : byte 1 bits 5-1, forme du support */
const VISA_FFI_FORM = {
  0: "Carte standard (ID-1, ISO 7810)", 1: "Mini-carte", 2: "Support sans contact non-carte (clé, bague, sticker…)",
  3: "Mobile grand public", 4: "Objet porté au poignet (montre, bracelet…)",
};
/* Form Factor Indicator (9F6E), Mastercard Third Party Data : Device Type (2 caractères ASCII) */
const MC_DEVICE_TYPES = {
  '00': "Carte", '01': "Élément sécurisé amovible piloté par l'opérateur mobile (SIM/UICC)", '02': "Porte-clés",
  '03': "Montre à élément sécurisé fixe non piloté par l'opérateur", '04': "Tag mobile", '05': "Bracelet",
  '06': "Étui ou coque de téléphone", '07': "Mobile à élément sécurisé fixe piloté par l'opérateur",
  '08': "Élément sécurisé amovible non piloté par l'opérateur (ex. carte mémoire)",
  '09': "Mobile à élément sécurisé fixe non piloté par l'opérateur",
  '10': "Élément sécurisé amovible opérateur, pour tablette/liseuse",
  '11': "Tablette/liseuse à élément sécurisé fixe piloté par l'opérateur",
  '12': "Élément sécurisé amovible non-opérateur, pour tablette/liseuse",
  '13': "Tablette/liseuse à élément sécurisé fixe non piloté par l'opérateur",
  '14': "Mobile, application de paiement dans le processeur hôte",
  '15': "Tablette/liseuse, application de paiement dans le processeur hôte",
  '16': "Mobile, application de paiement en zone sécurisée (TEE)",
  '17': "Tablette/liseuse, application de paiement en zone sécurisée (TEE)",
  '18': "Montre, application de paiement en zone sécurisée (TEE)",
  '19': "Montre, application de paiement dans le processeur hôte",
  '20': "Carte", '21': "Téléphone mobile", '22': "Tablette / liseuse", '23': "Montre / bracelet",
  '24': "Sticker", '25': "PC ou ordinateur portable", '26': "Étui ou coque de téléphone",
  '27': "Porte-clés ou tag mobile", '28': "Bijou (bague, bracelet, boutons de manchette)",
  '29': "Accessoire de mode (sac, breloque, lunettes)", '30': "Vêtement", '31': "Appareil électroménager",
  '32': "Véhicule", '33': "Appareil média/gaming", '34': "Casque de réalité virtuelle",
};


/* Tables ISO 4217 / ISO 3166-1 numeriques, noms FR, generees via pycountry + Babel/CLDR (session v3-decodeurs) */
const CURRENCY_DICT = {"008":{"code":"ALL","name":"lek albanais"},"012":{"code":"DZD","name":"dinar algérien"},"032":{"code":"ARS","name":"peso argentin"},"036":{"code":"AUD","name":"dollar australien"},"044":{"code":"BSD","name":"dollar bahaméen"},"048":{"code":"BHD","name":"dinar bahreïni"},"050":{"code":"BDT","name":"taka bangladeshi"},"051":{"code":"AMD","name":"dram arménien"},"052":{"code":"BBD","name":"dollar barbadien"},"060":{"code":"BMD","name":"dollar bermudien"},"064":{"code":"BTN","name":"ngultrum bouthanais"},"068":{"code":"BOB","name":"boliviano bolivien"},"072":{"code":"BWP","name":"pula botswanais"},"084":{"code":"BZD","name":"dollar bélizéen"},"090":{"code":"SBD","name":"dollar des îles Salomon"},"096":{"code":"BND","name":"dollar brunéien"},"104":{"code":"MMK","name":"kyat myanmarais"},"108":{"code":"BIF","name":"franc burundais"},"116":{"code":"KHR","name":"riel cambodgien"},"124":{"code":"CAD","name":"dollar canadien"},"132":{"code":"CVE","name":"escudo capverdien"},"136":{"code":"KYD","name":"dollar des îles Caïmans"},"144":{"code":"LKR","name":"roupie srilankaise"},"152":{"code":"CLP","name":"peso chilien"},"156":{"code":"CNY","name":"yuan renminbi chinois"},"170":{"code":"COP","name":"peso colombien"},"174":{"code":"KMF","name":"franc comorien"},"188":{"code":"CRC","name":"colón costaricain"},"192":{"code":"CUP","name":"peso cubain"},"203":{"code":"CZK","name":"couronne tchèque"},"208":{"code":"DKK","name":"couronne danoise"},"214":{"code":"DOP","name":"peso dominicain"},"222":{"code":"SVC","name":"colón salvadorien"},"230":{"code":"ETB","name":"birr éthiopien"},"232":{"code":"ERN","name":"nafka érythréen"},"238":{"code":"FKP","name":"livre des îles Malouines"},"242":{"code":"FJD","name":"dollar fidjien"},"262":{"code":"DJF","name":"franc djiboutien"},"270":{"code":"GMD","name":"dalasi gambien"},"292":{"code":"GIP","name":"livre de Gibraltar"},"320":{"code":"GTQ","name":"quetzal guatémaltèque"},"324":{"code":"GNF","name":"franc guinéen"},"328":{"code":"GYD","name":"dollar du Guyana"},"332":{"code":"HTG","name":"gourde haïtienne"},"340":{"code":"HNL","name":"lempira hondurien"},"344":{"code":"HKD","name":"dollar de Hong Kong"},"348":{"code":"HUF","name":"forint hongrois"},"352":{"code":"ISK","name":"couronne islandaise"},"356":{"code":"INR","name":"roupie indienne"},"360":{"code":"IDR","name":"roupie indonésienne"},"364":{"code":"IRR","name":"riyal iranien"},"368":{"code":"IQD","name":"dinar irakien"},"376":{"code":"ILS","name":"nouveau shekel israélien"},"388":{"code":"JMD","name":"dollar jamaïcain"},"392":{"code":"JPY","name":"yen japonais"},"396":{"code":"XAD","name":"Arab Accounting Dinar"},"398":{"code":"KZT","name":"tenge kazakh"},"400":{"code":"JOD","name":"dinar jordanien"},"404":{"code":"KES","name":"shilling kényan"},"408":{"code":"KPW","name":"won nord-coréen"},"410":{"code":"KRW","name":"won sud-coréen"},"414":{"code":"KWD","name":"dinar koweïtien"},"417":{"code":"KGS","name":"som kirghize"},"418":{"code":"LAK","name":"kip laotien"},"422":{"code":"LBP","name":"livre libanaise"},"426":{"code":"LSL","name":"loti lesothan"},"430":{"code":"LRD","name":"dollar libérien"},"434":{"code":"LYD","name":"dinar libyen"},"446":{"code":"MOP","name":"pataca macanaise"},"454":{"code":"MWK","name":"kwacha malawite"},"458":{"code":"MYR","name":"ringgit malais"},"462":{"code":"MVR","name":"rufiyaa maldivienne"},"480":{"code":"MUR","name":"roupie mauricienne"},"484":{"code":"MXN","name":"peso mexicain"},"496":{"code":"MNT","name":"tugrik mongol"},"498":{"code":"MDL","name":"leu moldave"},"504":{"code":"MAD","name":"dirham marocain"},"512":{"code":"OMR","name":"riyal omanais"},"516":{"code":"NAD","name":"dollar namibien"},"524":{"code":"NPR","name":"roupie népalaise"},"532":{"code":"XCG","name":"florin caribéen"},"533":{"code":"AWG","name":"florin arubais"},"548":{"code":"VUV","name":"vatu vanuatuan"},"554":{"code":"NZD","name":"dollar néo-zélandais"},"558":{"code":"NIO","name":"córdoba oro nicaraguayen"},"566":{"code":"NGN","name":"naira nigérian"},"578":{"code":"NOK","name":"couronne norvégienne"},"586":{"code":"PKR","name":"roupie pakistanaise"},"590":{"code":"PAB","name":"balboa panaméen"},"598":{"code":"PGK","name":"kina papouan-néo-guinéen"},"600":{"code":"PYG","name":"guaraní paraguayen"},"604":{"code":"PEN","name":"sol péruvien"},"608":{"code":"PHP","name":"peso philippin"},"634":{"code":"QAR","name":"riyal qatari"},"643":{"code":"RUB","name":"rouble russe"},"646":{"code":"RWF","name":"franc rwandais"},"654":{"code":"SHP","name":"livre de Sainte-Hélène"},"682":{"code":"SAR","name":"riyal saoudien"},"690":{"code":"SCR","name":"roupie des Seychelles"},"702":{"code":"SGD","name":"dollar de Singapour"},"704":{"code":"VND","name":"dông vietnamien"},"706":{"code":"SOS","name":"shilling somalien"},"710":{"code":"ZAR","name":"rand sud-africain"},"728":{"code":"SSP","name":"livre sud-soudanaise"},"748":{"code":"SZL","name":"lilangeni swazi"},"752":{"code":"SEK","name":"couronne suédoise"},"756":{"code":"CHF","name":"franc suisse"},"760":{"code":"SYP","name":"livre syrienne"},"764":{"code":"THB","name":"baht thaïlandais"},"776":{"code":"TOP","name":"pa’anga tongan"},"780":{"code":"TTD","name":"dollar de Trinité-et-Tobago"},"784":{"code":"AED","name":"dirham des Émirats arabes unis"},"788":{"code":"TND","name":"dinar tunisien"},"800":{"code":"UGX","name":"shilling ougandais"},"807":{"code":"MKD","name":"denar macédonien"},"818":{"code":"EGP","name":"livre égyptienne"},"826":{"code":"GBP","name":"livre sterling"},"834":{"code":"TZS","name":"shilling tanzanien"},"840":{"code":"USD","name":"dollar des États-Unis"},"858":{"code":"UYU","name":"peso uruguayen"},"860":{"code":"UZS","name":"sum ouzbek"},"882":{"code":"WST","name":"tala samoan"},"886":{"code":"YER","name":"riyal yéménite"},"901":{"code":"TWD","name":"nouveau dollar taïwanais"},"924":{"code":"ZWG","name":"Zimbabwe Gold"},"925":{"code":"SLE","name":"leone sierra-léonais"},"926":{"code":"VED","name":"Bolívar Soberano"},"927":{"code":"UYW","name":"unité de salaire nominal uruguayenne"},"928":{"code":"VES","name":"bolivar vénézuélien"},"929":{"code":"MRU","name":"ouguiya mauritanien"},"930":{"code":"STN","name":"dobra santoméen"},"933":{"code":"BYN","name":"rouble biélorusse"},"934":{"code":"TMT","name":"nouveau manat turkmène"},"936":{"code":"GHS","name":"cédi ghanéen"},"938":{"code":"SDG","name":"livre soudanaise"},"940":{"code":"UYI","name":"peso uruguayen (unités indexées)"},"941":{"code":"RSD","name":"dinar serbe"},"943":{"code":"MZN","name":"metical mozambicain"},"944":{"code":"AZN","name":"manat azéri"},"946":{"code":"RON","name":"leu roumain"},"947":{"code":"CHE","name":"euro WIR"},"948":{"code":"CHW","name":"franc WIR"},"949":{"code":"TRY","name":"livre turque"},"950":{"code":"XAF","name":"franc CFA (BEAC)"},"951":{"code":"XCD","name":"dollar des Caraïbes orientales"},"952":{"code":"XOF","name":"franc CFA (BCEAO)"},"953":{"code":"XPF","name":"franc CFP"},"955":{"code":"XBA","name":"unité européenne composée"},"956":{"code":"XBB","name":"unité monétaire européenne"},"957":{"code":"XBC","name":"unité de compte européenne (XBC)"},"958":{"code":"XBD","name":"unité de compte européenne (XBD)"},"959":{"code":"XAU","name":"or"},"960":{"code":"XDR","name":"droit de tirage spécial"},"961":{"code":"XAG","name":"argent"},"962":{"code":"XPT","name":"platine"},"963":{"code":"XTS","name":"(devise de test)"},"964":{"code":"XPD","name":"palladium"},"965":{"code":"XUA","name":"unité de compte ADB"},"967":{"code":"ZMW","name":"kwacha zambien"},"968":{"code":"SRD","name":"dollar surinamais"},"969":{"code":"MGA","name":"ariary malgache"},"970":{"code":"COU","name":"unité de valeur réelle colombienne"},"971":{"code":"AFN","name":"afghani afghan"},"972":{"code":"TJS","name":"somoni tadjik"},"973":{"code":"AOA","name":"kwanza angolais"},"976":{"code":"CDF","name":"franc congolais"},"977":{"code":"BAM","name":"mark convertible bosniaque"},"978":{"code":"EUR","name":"euro"},"979":{"code":"MXV","name":"unité de conversion mexicaine (UDI)"},"980":{"code":"UAH","name":"hryvnia ukrainienne"},"981":{"code":"GEL","name":"lari géorgien"},"984":{"code":"BOV","name":"mvdol bolivien"},"985":{"code":"PLN","name":"zloty polonais"},"986":{"code":"BRL","name":"réal brésilien"},"990":{"code":"CLF","name":"unité d’investissement chilienne"},"994":{"code":"XSU","name":"sucre"},"997":{"code":"USN","name":"dollar des Etats-Unis (jour suivant)"},"999":{"code":"XXX","name":"devise inconnue ou non valide"}};
const COUNTRY_DICT = {"004":"Afghanistan","008":"Albanie","010":"Antarctique","012":"Algérie","016":"Samoa américaines","020":"Andorre","024":"Angola","028":"Antigua-et-Barbuda","031":"Azerbaïdjan","032":"Argentine","036":"Australie","040":"Autriche","044":"Bahamas","048":"Bahreïn","050":"Bangladesh","051":"Arménie","052":"Barbade","056":"Belgique","060":"Bermudes","064":"Bhoutan","068":"Bolivie","070":"Bosnie-Herzégovine","072":"Botswana","074":"Île Bouvet","076":"Brésil","084":"Belize","086":"Territoire britannique de l’océan Indien","090":"Îles Salomon","092":"Îles Vierges britanniques","096":"Brunei","100":"Bulgarie","104":"Myanmar (Birmanie)","108":"Burundi","112":"Biélorussie","116":"Cambodge","120":"Cameroun","124":"Canada","132":"Cap-Vert","136":"Îles Caïmans","140":"République centrafricaine","144":"Sri Lanka","148":"Tchad","152":"Chili","156":"Chine","158":"Taïwan","162":"Île Christmas","166":"Îles Cocos","170":"Colombie","174":"Comores","175":"Mayotte","178":"Congo-Brazzaville","180":"Congo-Kinshasa","184":"Îles Cook","188":"Costa Rica","191":"Croatie","192":"Cuba","196":"Chypre","203":"Tchéquie","204":"Bénin","208":"Danemark","212":"Dominique","214":"République dominicaine","218":"Équateur","222":"Salvador","226":"Guinée équatoriale","231":"Éthiopie","232":"Érythrée","233":"Estonie","234":"Îles Féroé","238":"Îles Malouines","239":"Géorgie du Sud-et-les Îles Sandwich du Sud","242":"Fidji","246":"Finlande","248":"Îles Åland","250":"France","254":"Guyane française","258":"Polynésie française","260":"Terres australes françaises","262":"Djibouti","266":"Gabon","268":"Géorgie","270":"Gambie","275":"Territoires palestiniens","276":"Allemagne","288":"Ghana","292":"Gibraltar","296":"Kiribati","300":"Grèce","304":"Groenland","308":"Grenade","312":"Guadeloupe","316":"Guam","320":"Guatemala","324":"Guinée","328":"Guyana","332":"Haïti","334":"Îles Heard-et-MacDonald","336":"État de la Cité du Vatican","340":"Honduras","344":"R.A.S. chinoise de Hong Kong","348":"Hongrie","352":"Islande","356":"Inde","360":"Indonésie","364":"Iran","368":"Irak","372":"Irlande","376":"Israël","380":"Italie","384":"Côte d’Ivoire","388":"Jamaïque","392":"Japon","398":"Kazakhstan","400":"Jordanie","404":"Kenya","408":"Corée du Nord","410":"Corée du Sud","414":"Koweït","417":"Kirghizstan","418":"Laos","422":"Liban","426":"Lesotho","428":"Lettonie","430":"Liberia","434":"Libye","438":"Liechtenstein","440":"Lituanie","442":"Luxembourg","446":"R.A.S. chinoise de Macao","450":"Madagascar","454":"Malawi","458":"Malaisie","462":"Maldives","466":"Mali","470":"Malte","474":"Martinique","478":"Mauritanie","480":"Maurice","484":"Mexique","492":"Monaco","496":"Mongolie","498":"Moldavie","499":"Monténégro","500":"Montserrat","504":"Maroc","508":"Mozambique","512":"Oman","516":"Namibie","520":"Nauru","524":"Népal","528":"Pays-Bas","531":"Curaçao","533":"Aruba","534":"Saint-Martin (partie néerlandaise)","535":"Pays-Bas caribéens","540":"Nouvelle-Calédonie","548":"Vanuatu","554":"Nouvelle-Zélande","558":"Nicaragua","562":"Niger","566":"Nigeria","570":"Niue","574":"Île Norfolk","578":"Norvège","580":"Îles Mariannes du Nord","581":"Îles mineures éloignées des États-Unis","583":"Micronésie","584":"Îles Marshall","585":"Palaos","586":"Pakistan","591":"Panama","598":"Papouasie-Nouvelle-Guinée","600":"Paraguay","604":"Pérou","608":"Philippines","612":"Îles Pitcairn","616":"Pologne","620":"Portugal","624":"Guinée-Bissau","626":"Timor oriental","630":"Porto Rico","634":"Qatar","638":"La Réunion","642":"Roumanie","643":"Russie","646":"Rwanda","652":"Saint-Barthélemy","654":"Sainte-Hélène","659":"Saint-Christophe-et-Niévès","660":"Anguilla","662":"Sainte-Lucie","663":"Saint-Martin","666":"Saint-Pierre-et-Miquelon","670":"Saint-Vincent-et-les Grenadines","674":"Saint-Marin","678":"Sao Tomé-et-Principe","682":"Arabie saoudite","686":"Sénégal","688":"Serbie","690":"Seychelles","694":"Sierra Leone","702":"Singapour","703":"Slovaquie","704":"Viêt Nam","705":"Slovénie","706":"Somalie","710":"Afrique du Sud","716":"Zimbabwe","724":"Espagne","728":"Soudan du Sud","729":"Soudan","732":"Sahara occidental","740":"Suriname","744":"Svalbard et Jan Mayen","748":"Eswatini","752":"Suède","756":"Suisse","760":"Syrie","762":"Tadjikistan","764":"Thaïlande","768":"Togo","772":"Tokelau","776":"Tonga","780":"Trinité-et-Tobago","784":"Émirats arabes unis","788":"Tunisie","792":"Turquie","795":"Turkménistan","796":"Îles Turques-et-Caïques","798":"Tuvalu","800":"Ouganda","804":"Ukraine","807":"Macédoine du Nord","818":"Égypte","826":"Royaume-Uni","831":"Guernesey","832":"Jersey","833":"Île de Man","834":"Tanzanie","840":"États-Unis","850":"Îles Vierges des États-Unis","854":"Burkina Faso","858":"Uruguay","860":"Ouzbékistan","862":"Venezuela","876":"Wallis-et-Futuna","882":"Samoa","887":"Yémen","894":"Zambie"};
