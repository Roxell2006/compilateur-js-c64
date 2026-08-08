from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, LongTable, NextPageTemplate, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle, XPreformatted
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "guide-pratique-js-c64-debutant.pdf"
COURSE_SOURCE = (ROOT / "tmp" / "pdfs" / "course-example.js").read_text(encoding="utf-8")
COURSE_SOURCE_DISPLAY = "\n".join(line for line in COURSE_SOURCE.splitlines() if line.strip())

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
MARGIN_TOP = 18 * mm
MARGIN_BOTTOM = 17 * mm

INK = colors.HexColor("#17213A")
MUTED = colors.HexColor("#526078")
C64_BLUE = colors.HexColor("#4039A0")
C64_LIGHT = colors.HexColor("#7C75E8")
C64_CYAN = colors.HexColor("#74D5D0")
PAPER = colors.HexColor("#F7F8FC")
LINE = colors.HexColor("#D9DDED")
CODE_BG = colors.HexColor("#151A2C")
CODE_FG = colors.HexColor("#F2F4FF")
YELLOW = colors.HexColor("#F4D35E")
GREEN = colors.HexColor("#DDF4E4")
ORANGE = colors.HexColor("#FFF0D5")
RED = colors.HexColor("#FFE2E2")


pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
pdfmetrics.registerFont(TTFont("Consolas", r"C:\Windows\Fonts\consola.ttf"))
pdfmetrics.registerFont(TTFont("Consolas-Bold", r"C:\Windows\Fonts\consolab.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")
pdfmetrics.registerFontFamily("Consolas", normal="Consolas", bold="Consolas-Bold")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverKicker", fontName="Arial-Bold", fontSize=11, leading=14,
    textColor=C64_CYAN, alignment=TA_CENTER, spaceAfter=8
))
styles.add(ParagraphStyle(
    name="CoverTitle", fontName="Arial-Bold", fontSize=30, leading=34,
    textColor=colors.white, alignment=TA_CENTER, spaceAfter=14
))
styles.add(ParagraphStyle(
    name="CoverSub", fontName="Arial", fontSize=13, leading=19,
    textColor=colors.HexColor("#E7E8FF"), alignment=TA_CENTER, spaceAfter=12
))
styles.add(ParagraphStyle(
    name="H1Guide", fontName="Arial-Bold", fontSize=19, leading=23,
    textColor=C64_BLUE, spaceBefore=4, spaceAfter=10, keepWithNext=True
))
styles.add(ParagraphStyle(
    name="H2Guide", fontName="Arial-Bold", fontSize=13, leading=17,
    textColor=INK, spaceBefore=12, spaceAfter=6, keepWithNext=True
))
styles.add(ParagraphStyle(
    name="H3Guide", fontName="Arial-Bold", fontSize=10.5, leading=14,
    textColor=C64_BLUE, spaceBefore=8, spaceAfter=4, keepWithNext=True
))
styles.add(ParagraphStyle(
    name="BodyGuide", fontName="Arial", fontSize=9.5, leading=13.5,
    textColor=INK, spaceAfter=6
))
styles.add(ParagraphStyle(
    name="SmallGuide", fontName="Arial", fontSize=8, leading=11,
    textColor=MUTED, spaceAfter=4
))
styles.add(ParagraphStyle(
    name="BulletGuide", fontName="Arial", fontSize=9.2, leading=13,
    textColor=INK, leftIndent=13, firstLineIndent=-7, bulletIndent=4,
    spaceAfter=3
))
styles.add(ParagraphStyle(
    name="CodeGuide", fontName="Consolas", fontSize=7.35, leading=10.1,
    textColor=CODE_FG, backColor=CODE_BG, borderColor=CODE_BG,
    borderWidth=1, borderPadding=7, spaceBefore=4, spaceAfter=8
))
styles.add(ParagraphStyle(
    name="TableHead", fontName="Arial-Bold", fontSize=8.2, leading=10.5,
    textColor=colors.white
))
styles.add(ParagraphStyle(
    name="TableBody", fontName="Arial", fontSize=7.9, leading=10.5,
    textColor=INK
))
styles.add(ParagraphStyle(
    name="Callout", fontName="Arial", fontSize=8.8, leading=12.5,
    textColor=INK
))
styles.add(ParagraphStyle(
    name="TOC1", fontName="Arial-Bold", fontSize=10, leading=14,
    leftIndent=0, firstLineIndent=0, textColor=INK, spaceBefore=3
))
styles.add(ParagraphStyle(
    name="TOC2", fontName="Arial", fontSize=8.5, leading=12,
    leftIndent=13, firstLineIndent=0, textColor=MUTED, spaceBefore=1
))


class GuideDocTemplate(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name in ("H1Guide", "H2Guide"):
            level = 0 if flowable.style.name == "H1Guide" else 1
            text = flowable.getPlainText()
            key = getattr(flowable, "bookmark_name", None)
            if key:
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(text, key, level=level, closed=False)
                self.notify("TOCEntry", (level, text, self.page, key))


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(C64_BLUE)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFillColor(C64_LIGHT)
    for row in range(4):
        for col in range(10):
            x = 18 * mm + col * 18 * mm
            y = 20 * mm + row * 12 * mm
            canvas.rect(x, y, 6 * mm, 6 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(C64_CYAN)
    canvas.setLineWidth(1.2)
    canvas.rect(12 * mm, 12 * mm, PAGE_W - 24 * mm, PAGE_H - 24 * mm, fill=0, stroke=1)
    canvas.restoreState()


def body_page(canvas, doc):
    canvas.saveState()
    canvas.setFont("Arial", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MARGIN_X, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


doc = GuideDocTemplate(
    str(OUTPUT), pagesize=A4,
    leftMargin=MARGIN_X, rightMargin=MARGIN_X,
    topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
    title="JS-C64 - Guide pratique du débutant",
    author="Projet js-c64",
    subject="Cours condensé, compilation et référence des fonctions js-c64"
)
cover_frame = Frame(MARGIN_X, MARGIN_BOTTOM, PAGE_W - 2 * MARGIN_X,
                    PAGE_H - MARGIN_TOP - MARGIN_BOTTOM, id="cover-frame")
body_frame = Frame(MARGIN_X, MARGIN_BOTTOM, PAGE_W - 2 * MARGIN_X,
                   PAGE_H - MARGIN_TOP - MARGIN_BOTTOM, id="body-frame")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[cover_frame], onPage=cover_page),
    PageTemplate(id="body", frames=[body_frame], onPageEnd=body_page),
])

story = []
heading_counter = 0


def P(text, style="BodyGuide"):
    story.append(Paragraph(text, styles[style]))


def H1(text):
    global heading_counter
    heading_counter += 1
    paragraph = Paragraph(text, styles["H1Guide"])
    paragraph.bookmark_name = f"h-{heading_counter}"
    story.append(paragraph)


def H2(text):
    global heading_counter
    heading_counter += 1
    paragraph = Paragraph(text, styles["H2Guide"])
    paragraph.bookmark_name = f"h-{heading_counter}"
    story.append(paragraph)


def H3(text):
    story.append(Paragraph(text, styles["H3Guide"]))


def bullets(items):
    for item in items:
        story.append(Paragraph(f"• {item}", styles["BulletGuide"]))
    story.append(Spacer(1, 2))


def code(text):
    story.append(XPreformatted(escape(text.strip("\n")), styles["CodeGuide"]))


def callout(title, text, tone="blue"):
    palette = {
        "blue": colors.HexColor("#E7E9FF"),
        "green": GREEN,
        "orange": ORANGE,
        "red": RED,
    }
    content = Paragraph(f"<b>{escape(title)}</b><br/>{text}", styles["Callout"])
    box = Table([[content]], colWidths=[PAGE_W - 2 * MARGIN_X])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), palette[tone]),
        ("BOX", (0, 0), (-1, -1), 0.7, C64_LIGHT),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([box, Spacer(1, 7)])


def guide_table(headers, rows, widths=None):
    data = [[Paragraph(escape(str(cell)), styles["TableHead"]) for cell in headers]]
    for row in rows:
        data.append([Paragraph(str(cell), styles["TableBody"]) for cell in row])
    if widths is None:
        widths = [(PAGE_W - 2 * MARGIN_X) / len(headers)] * len(headers)
    table = LongTable(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C64_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER]),
    ]))
    story.extend([table, Spacer(1, 8)])


def new_page():
    story.append(PageBreak())


# Cover
story.append(Spacer(1, 42 * mm))
story.append(Paragraph("COMPILATEUR JAVASCRIPT VERS COMMODORE 64", styles["CoverKicker"]))
story.append(Paragraph("JS-C64", styles["CoverTitle"]))
story.append(Paragraph("Guide pratique du débutant", styles["CoverTitle"]))
story.append(Paragraph(
    "Compiler un fichier .js en PRG, ASM, LST, BASIC ou D64<br/>"
    "et construire progressivement un petit jeu C64.", styles["CoverSub"]
))
story.append(Spacer(1, 20 * mm))
story.append(Paragraph("Édition condensée - API 1.0", styles["CoverKicker"]))
story.append(NextPageTemplate("body"))
story.append(PageBreak())


# Introduction and TOC
H1("Comment utiliser ce guide")
P("Ce document est une version condensée et progressive de <b>MODE_EMPLOI_DEBUTANT.txt</b>. "
  "Il est conçu pour être lu dans l'ordre une première fois, puis utilisé comme aide-mémoire.")
callout("Le principe en une phrase",
        "Vous écrivez un fichier JavaScript composé d'appels à <b>c64</b>. Le compilateur exécute ce fichier pendant le build et produit directement du code machine 6502 pour le Commodore 64.")
guide_table(
    ["Étape", "Ce que vous faites", "Résultat"],
    [
        ["1", "Écrire <font name='Consolas'>mon-jeu.js</font>", "Description du programme avec l'API c64"],
        ["2", "Lancer <font name='Consolas'>c64js build</font>", "Compilation sur le PC avec Node.js"],
        ["3", "Choisir l'extension de sortie", "PRG, ASM, LST, BAS, BIN ou D64"],
        ["4", "Ouvrir la sortie dans VICE ou sur un C64", "Le code 6502 s'exécute sans JavaScript"],
    ],
    [13 * mm, 76 * mm, 75 * mm]
)
H2("Table des matières")
toc = TableOfContents()
toc.levelStyles = [styles["TOC1"], styles["TOC2"]]
toc.dotsMinLevel = 0
story.append(toc)
new_page()


H1("1. Comprendre JS-C64")
H2("1.1 Ce que fait le compilateur")
P("JS-C64 n'embarque pas un moteur JavaScript dans le C64. Le fichier source est exécuté par Node.js au moment de la compilation. Chaque appel à l'objet <b>c64</b> demande au compilateur de générer des instructions 6502, des tables de données ou des routines runtime.")
bullets([
    "Le fichier <b>.js</b> est le source lisible et facile à modifier.",
    "Le fichier <b>.prg</b> contient le programme exécutable par le C64.",
    "Le C64 final n'a besoin ni de Node.js, ni de npm, ni du fichier JavaScript.",
    "Seules les fonctions réellement utilisées ajoutent leur runtime au programme final.",
])
H2("1.2 Coordonnées et valeurs importantes")
guide_table(
    ["Élément", "Valeur", "À retenir"],
    [
        ["Écran texte", "40 x 25 caractères", "x va de 0 à 39, y de 0 à 24"],
        ["Pixel d'un sprite", "24 x 21 en hires", "La coordonnée X du VIC-II utilise 9 bits"],
        ["Couleurs", "0 à 15", "Utilisez les constantes c64.COLOR_*"],
        ["Octet", "0 à 255", "Pour les valeurs signées, le compilateur gère les vitesses négatives"],
        ["Frame PAL", "50 Hz", "Une boucle de jeu est généralement appelée 50 fois par seconde"],
    ],
    [37 * mm, 42 * mm, 85 * mm]
)
callout("Important", "Le code exécuté pendant la compilation doit être fiable. Un fichier JS-C64 est du vrai JavaScript côté PC, même si son objectif est de produire du code 6502.", "orange")


H1("2. Installer et accéder à c64js")
H2("2.1 Préparation dans le dépôt du compilateur")
P("Cette méthode est la plus fiable pendant le développement de js-c64, notamment si Windows indique que la commande <b>c64js</b> n'est pas reconnue.")
code(r"""
cd "D:\Programmation\Vibe Coding Pro\compilateur js-c64"
Get-Location
Get-ChildItem package.json
node -v
npm -v
npm install
""")
P("Les guillemets autour du chemin sont obligatoires parce qu'il contient des espaces. <font name='Consolas'>npm install</font> est normalement nécessaire une seule fois, puis après une modification des dépendances.")
H2("2.2 Méthode recommandée dans ce dépôt")
code(r"""
node .\src\cli.js build .\examples\hello.js -o .\dist\hello.prg
""")
P("Cette commande appelle directement le programme de compilation. Elle fonctionne même si <font name='Consolas'>c64js</font> n'est pas installé globalement.")
H2("2.3 Dans votre propre projet avec npm")
code(r"""
npm install js-c64
npx c64js build .\examples\hello.js -o .\build\hello.prg
""")
P("<font name='Consolas'>npx</font> recherche la commande installée localement dans <font name='Consolas'>node_modules/.bin</font>. C'est la méthode conseillée pour un projet utilisateur reproductible.")
H2("2.4 Installation locale avant publication")
code(r"""
npm install "D:\Programmation\Vibe Coding Pro\compilateur js-c64"
npx c64js build .\examples\hello.js -o .\build\hello.prg
""")
H2("2.5 Commande globale facultative")
code(r"""
# À lancer depuis le dossier de js-c64
npm link
Get-Command c64js
c64js build .\examples\hello.js -o .\dist\hello.prg
""")
callout("Si c64js n'est pas reconnu", "Revenez à la commande fiable <font name='Consolas'>node .\\src\\cli.js build ...</font>, ou utilisez <font name='Consolas'>npx c64js</font> dans un projet où le package est installé.", "green")


H1("3. Compiler vers PRG, ASM, BAS, LST, BIN et D64")
H2("3.1 Les formats de sortie")
guide_table(
    ["Extension", "Contenu", "Usage principal"],
    [
        [".prg", "Exécutable C64 avec adresse de chargement", "Charger dans VICE puis RUN"],
        [".asm", "Assembleur 6502 lisible", "Étudier, déboguer ou reprendre le code"],
        [".lst", "Listing avec adresses et octets", "Relier le PC du C64 à une instruction précise"],
        [".bas", "Chargeur BASIC et lignes DATA", "Copier ou conserver le programme sous forme BASIC"],
        [".bin", "Code machine brut", "Intégration avancée sans en-tête PRG"],
        [".d64", "Image de disquette 1541", "Jeux multi-niveaux avec assets chargés à la demande"],
    ],
    [24 * mm, 70 * mm, 70 * mm]
)
H2("3.2 Commandes prêtes à copier")
code(r"""
# PRG exécutable
node .\src\cli.js build .\examples\hello.js -o .\dist\hello.prg

# Assembleur lisible
node .\src\cli.js build .\examples\hello.js -o .\dist\hello.asm --format asm

# Listing avec adresses
node .\src\cli.js build .\examples\hello.js -o .\dist\hello.lst --format lst

# BASIC avec DATA
node .\src\cli.js build .\examples\hello.js -o .\dist\hello.bas --format data

# Binaire brut
node .\src\cli.js build .\examples\hello.js -o .\dist\hello.bin --format bin
""")
P("Le format est déduit de l'extension. <font name='Consolas'>--format</font> reste utile pour rendre la commande explicite.")
H2("3.3 Options utiles")
guide_table(
    ["Option", "Exemple", "Effet"],
    [
        ["--sys", "--sys 49152", "Choisit l'adresse de départ, surtout pour BAS, ASM, LST et BIN"],
        ["--opt", "--opt balanced", "balanced par défaut, size pour la taille, speed pour la vitesse"],
        ["--map", "--map symbols.json", "Écrit les symboles et leurs adresses"],
        ["--report", "--report rapport.json", "Détaille mémoire, assets, routines et optimisations"],
        ["--assets", "--assets disk", "Place les assets de niveaux dans des fichiers disque"],
        ["--device", "--device 8", "Numéro du lecteur utilisé au runtime"],
        ["--disk-name", "--disk-name \"MON JEU\"", "Nom de l'image D64"],
        ["--program-name", "--program-name START", "Nom du PRG principal sur la disquette"],
    ],
    [28 * mm, 52 * mm, 84 * mm]
)
H2("3.4 Produire une D64 multi-niveaux")
code(r"""
node .\src\cli.js build .\examples\multilevel-d64.js `
  -o .\dist\multilevel.d64

node .\src\cli.js build .\examples\multilevel-d64.js `
  -o .\dist\jeu.d64 `
  --disk-name "MON JEU" --program-name START --device 8
""")
P("L'extension <b>.d64</b> active automatiquement les assets disque. L'image contient un PRG principal et des modules PRG de données chargés par le KERNAL lorsque <font name='Consolas'>level.activate()</font> ou une transition de niveau en a besoin.")
callout("PRG autonome ou D64", "Le même JavaScript peut produire un PRG autonome avec <font name='Consolas'>--assets inline</font>, ou une D64 plus adaptée aux nombreux niveaux avec les assets externes.")
code(r"""
# Runtime disque lisible en assembleur
node .\src\cli.js build .\examples\multilevel-d64.js `
  -o .\dist\multilevel.asm --format asm --assets disk

# Version PRG entièrement autonome
node .\src\cli.js build .\examples\multilevel-d64.js `
  -o .\dist\multilevel.prg --assets inline
""")


H1("4. Premier programme pas à pas")
H2("4.1 Créer le fichier JavaScript")
P("Créez par exemple <font name='Consolas'>examples/bonjour.js</font> :")
code(r"""
import { c64 } from "js-c64";

c64.clearScreen();
c64.borderColor(c64.COLOR_BLUE);
c64.backgroundColor(c64.COLOR_BLUE);
c64.textColor(c64.COLOR_WHITE);
c64.printCentered(12, "BONJOUR COMMODORE 64");
""")
H2("4.2 Compiler et lancer")
code(r"""
npx c64js build .\examples\bonjour.js -o .\build\bonjour.prg
""")
bullets([
    "Ouvrez <b>bonjour.prg</b> dans VICE.",
    "Si l'émulateur ne lance pas automatiquement le programme, tapez <font name='Consolas'>RUN</font>.",
    "Pour comprendre le résultat, produisez aussi <b>bonjour.asm</b> et <b>bonjour.lst</b>.",
])
H2("4.3 Ce que chaque ligne signifie")
guide_table(
    ["Code", "Rôle"],
    [
        ["import { c64 } ...", "Donne accès à l'API pendant la compilation"],
        ["clearScreen()", "Efface les 1 000 cellules de l'écran texte"],
        ["borderColor()", "Change la couleur de la bordure VIC-II"],
        ["backgroundColor()", "Change le fond de l'écran"],
        ["textColor()", "Choisit la couleur des prochains textes"],
        ["printCentered()", "Calcule automatiquement la colonne de départ"],
    ],
    [66 * mm, 98 * mm]
)


H1("5. Cours pratique - un mini-jeu au joystick")
P("L'exemple suivant a été compilé pendant la création de ce guide. Il montre une boucle de jeu, un sprite, le joystick du port 2, un score et un bruitage non bloquant.")
H2("5.1 Le programme complet")
code(COURSE_SOURCE_DISPLAY)
H2("5.2 Comprendre les quatre étapes")
H3("Étape A - Les ressources de compilation")
P("<font name='Consolas'>PLAYER_PIXELS</font> est calculé par JavaScript sur le PC. Le résultat devient 63 octets de données sprite dans le PRG.")
H3("Étape B - Les objets runtime")
P("<font name='Consolas'>joystick</font>, <font name='Consolas'>score</font> et <font name='Consolas'>player</font> produisent des variables et routines 6502. Ils ne sont pas des objets JavaScript présents sur le C64.")
H3("Étape C - L'initialisation")
P("Le contenu de <font name='Consolas'>c64.game.init()</font> est exécuté une seule fois : préparation de l'écran et dessin initial du score.")
H3("Étape D - La frame")
P("Le contenu de <font name='Consolas'>c64.game.frame()</font> est exécuté 50 fois par seconde. La vitesse est remise à zéro, modifiée selon le joystick, puis <font name='Consolas'>player.update()</font> applique le mouvement et les limites.")
H2("5.3 Compiler le mini-jeu")
code(r"""
npx c64js build .\examples\mini-jeu.js -o .\build\mini-jeu.prg
npx c64js build .\examples\mini-jeu.js -o .\build\mini-jeu.asm --format asm
npx c64js build .\examples\mini-jeu.js -o .\build\mini-jeu.lst --format lst
""")
callout("Exercice", "Ajoutez une touche pause, changez la vitesse de 2 à 3, puis remplacez le bruitage <font name='Consolas'>sid.click()</font> par un autre effet. Recompilez après chaque petite modification.", "green")


H1("6. Affichage, couleurs et mémoire")
H2("6.1 Fonctions d'écran essentielles")
guide_table(
    ["Fonction", "Description", "Exemple"],
    [
        ["c64.clearScreen()", "Efface l'écran texte", "c64.clearScreen();"],
        ["c64.borderColor(c)", "Couleur de bordure", "c64.borderColor(c64.COLOR_BLACK);"],
        ["c64.backgroundColor(c)", "Couleur de fond", "c64.backgroundColor(c64.COLOR_BLUE);"],
        ["c64.textColor(c)", "Couleur des textes suivants", "c64.textColor(c64.COLOR_WHITE);"],
        ["c64.print(text)", "Écrit à la position courante", "c64.print(\"READY\");"],
        ["c64.printAt(x,y,text)", "Écrit à une cellule précise", "c64.printAt(2, 5, \"SCORE\");"],
        ["c64.printCentered(y,text)", "Centre sur 40 colonnes", "c64.printCentered(12, \"PAUSE\");"],
        ["c64.writeChar(x,y,ch,c)", "Écrit un code écran", "c64.writeChar(10, 10, 64, 7);"],
        ["c64.fillRect(...) ", "Remplit un rectangle", "fillRect(1,1,10,5,32,1)"],
        ["c64.drawFrame(...) ", "Dessine un cadre", "drawFrame(1,1,38,8,81,1)"],
        ["c64.clearLine(y,...)", "Nettoie une ligne", "c64.clearLine(20);"],
    ],
    [50 * mm, 60 * mm, 54 * mm]
)
H2("6.2 Les 16 couleurs")
guide_table(
    ["Constante", "N°", "Constante", "N°"],
    [
        ["COLOR_BLACK", "0", "COLOR_WHITE", "1"],
        ["COLOR_RED", "2", "COLOR_CYAN", "3"],
        ["COLOR_VIOLET", "4", "COLOR_GREEN", "5"],
        ["COLOR_BLUE", "6", "COLOR_YELLOW", "7"],
        ["COLOR_ORANGE", "8", "COLOR_BROWN", "9"],
        ["COLOR_LIGHTRED", "10", "COLOR_DARKGREY", "11"],
        ["COLOR_GREY", "12", "COLOR_LIGHTGREEN", "13"],
        ["COLOR_LIGHTBLUE", "14", "COLOR_LIGHTGREY", "15"],
    ],
    [51 * mm, 20 * mm, 58 * mm, 20 * mm]
)
H2("6.3 Mémoire et données")
guide_table(
    ["API", "Utilité"],
    [
        ["c64.poke(adresse, valeur)", "Écrit un octet à une adresse"],
        ["c64.peek(adresse)", "Lit un octet pour une opération générée"],
        ["c64.memset(adresse, valeur, longueur)", "Remplit une zone mémoire"],
        ["c64.memcpy(destination, source, longueur)", "Copie une zone mémoire"],
        ["c64.copyDataTo(adresse, dataRef, longueur)", "Copie une donnée nommée"],
        ["c64.data.byte/word/string", "Déclare des données constantes"],
        ["c64.data.screenString", "Prépare une chaîne en codes écran"],
        ["c64.dataRef(nom)", "Référence une donnée déclarée"],
        ["c64.var.byte/word/bool", "Déclare un état mutable au runtime"],
        ["c64.table.byte(nom, valeurs)", "Crée un tableau d'octets runtime"],
    ],
    [78 * mm, 86 * mm]
)


H1("7. Boucle de jeu, contrôles et entrées")
H2("7.1 Structure conseillée")
code(r"""
const joystick = c64.input.joystick(2);
const active = c64.var.bool("active", { initial: true });

c64.game.init(() => {
  // Une seule fois
});

c64.game.frame(() => {
  // À chaque image logique
  c64.control.if(joystick.firePressed(), () => active.toggle());
}, { hz: 50 });
""")
H2("7.2 Contrôle runtime")
guide_table(
    ["Fonction", "Rôle"],
    [
        ["c64.control.if(condition, oui, non?)", "Génère un branchement runtime"],
        ["c64.control.while(condition, corps, {maxIterations})", "Boucle bornée obligatoire"],
        ["c64.control.routine(nom, fonction)", "Déclare une sous-routine partagée"],
        ["c64.control.call(nom)", "Appelle une routine déclarée"],
        ["c64.game.every(n, fonction)", "Exécute une action toutes les n frames"],
        ["variable.set/inc/dec/add/sub/toggle", "Modifie une variable runtime"],
        ["variable.eq/ne/lt/lte/gt/gte", "Construit une condition runtime"],
    ],
    [78 * mm, 86 * mm]
)
H2("7.3 Joystick et clavier")
guide_table(
    ["API", "Valeur"],
    [
        ["joystick.left/right/up/down()", "Vrai tant que la direction est maintenue"],
        ["joystick.fire()", "Vrai tant que FIRE est maintenu"],
        ["joystick.firePressed()", "Vrai une seule frame au moment de l'appui"],
        ["joystick.fireReleased()", "Vrai une seule frame au relâchement"],
        ["c64.input.keyboard({ pause: c64.KEY_SPACE })", "Déclare les touches à surveiller"],
        ["keys.pause.pressed()", "Détecte un nouvel appui sans répétition"],
    ],
    [92 * mm, 72 * mm]
)
callout("Piège fréquent", "N'utilisez pas une condition JavaScript normale pour tester une variable runtime. Utilisez <font name='Consolas'>c64.control.if(variable.eq(...), ...)</font>.", "orange")


H1("8. Sprites, animations et collisions")
H2("8.1 Créer un sprite")
code(r"""
const player = c64.sprite.create(0, {
  x: 100,
  y: 100,
  data: SPRITE_63_OCTETS,
  color: c64.COLOR_YELLOW,
  multicolor: false,
  expandX: false,
  expandY: false,
  hitbox: { offsetX: 0, offsetY: 0, width: 24, height: 21 },
  minX: 24,
  maxX: 296
});
""")
H2("8.2 Méthodes principales")
guide_table(
    ["Méthode", "Description"],
    [
        ["sprite.setPosition(x, y)", "Positionne le sprite, y compris au-delà de X=255"],
        ["sprite.setVelocity(vx, vy)", "Définit une vitesse signée"],
        ["sprite.update()", "Applique mouvement, animation, limites et affichage"],
        ["sprite.play(animation)", "Choisit une animation nommée sans la redémarrer inutilement"],
        ["sprite.collides(other)", "Collision AABB logicielle"],
        ["sprite.enable()/disable()", "Affiche ou masque le sprite logique"],
        ["sprite.respawn()", "Réinitialise l'entité lorsqu'elle vient d'une map"],
    ],
    [75 * mm, 89 * mm]
)
H2("8.3 Les sprites virtuels 8 à 15")
P("Créer le sprite 8 à 15 active automatiquement le multiplexeur. Le runtime trie les sprites par Y et réutilise les huit canaux matériels lorsque le raster avance.")
bullets([
    "Les 16 sprites logiques peuvent être placés librement en X et Y.",
    "Le VIC-II ne peut jamais afficher plus de huit sprites sur une même ligne raster.",
    "Un sprite agrandi verticalement occupe davantage de lignes et réduit les possibilités de réutilisation.",
    "Avec le multiplexage, préférez les collisions logicielles <font name='Consolas'>collides()</font>.",
    "Une boucle <font name='Consolas'>c64.game.frame()</font> est obligatoire.",
])


H1("9. Charsets, tiles, maps et scrolling")
H2("9.1 Charger une map JSON")
code(r"""
const level = c64.assets.loadMap("assets/mon-niveau.json");

c64.game.init(() => {
  c64.charset.use(level.charset, { address: 0x3000 });
  c64.map.draw(level, { x: 0, y: 0 });
});
""")
P("Les codes écran 0 à 63 sont réservés automatiquement aux caractères originaux du C64. Le compilateur les copie depuis la ROM vers la RAM dès qu'un charset personnalisé est installé. Le Studio n'exporte donc que les glyphes personnalisés, qui commencent au code 64.")
H2("9.2 Lire et modifier la map")
code(r"""
const tileX = c64.var.byte("tileX", { initial: 4 });
const tileY = c64.var.byte("tileY", { initial: 7 });

c64.control.if(level.map(tileX, tileY).isSolid(), () => {
  level.map(tileX, tileY).set(0);
});
""")
guide_table(
    ["Opération", "Description"],
    [
        ["level.map(x, y).set(tile)", "Modifie la map et redessine la cellule visible"],
        [".load(variable)", "Charge l'indice de tile dans une variable"],
        [".eq/.ne(tile)", "Compare la cellule"],
        [".isSolid()", "Teste la collision logique non nulle/solide"],
        [".hasCollision(valeur)", "Teste une classe précise de collision"],
        ["level.activate({draw:true})", "Active et dessine un niveau, y compris depuis D64"],
        ["level.isActive()", "Condition runtime indiquant le niveau actif"],
    ],
    [80 * mm, 84 * mm]
)
H2("9.3 Objets de map et caméra")
code(r"""
const player = c64.map.spawn(level, "player", {
  sprite: 0,
  maxCollisionSpeed: 8,
  collisionBehaviors: { 1: "solid", 2: "danger" }
});

const camera = c64.map.scroller(level, {
  width: 38,
  x: 1,
  panel: { bottom: 3 }
});

camera.follow(player);
""")
P("Le scroller gère le déplacement fin X/Y, la copie des nouvelles lignes ou colonnes et une bande IRQ pour garder un panneau fixe. <font name='Consolas'>panel: \"bottom\"</font> conserve la compatibilité demi-écran ; <font name='Consolas'>{ bottom: 3 }</font> réserve exactement trois lignes.")
H2("9.4 Collisions de plateforme")
guide_table(
    ["Comportement", "Effet"],
    [
        ["solid", "Bloque l'entité dans toutes les directions"],
        ["platform", "Bloque une chute mais se traverse par le bas"],
        ["danger", "Déclare un contact dangereux pour le jeu"],
        ["exit", "Déclare une sortie ou transition"],
        ["ladder", "Déclare une zone d'échelle"],
    ],
    [48 * mm, 116 * mm]
)


H1("10. Scènes et jeux multi-niveaux")
H2("10.1 Une scène par état du jeu")
code(r"""
c64.game.scene("title", {
  enter() { c64.printCentered(12, "FIRE TO START"); },
  update() {
    c64.control.if(joystick.firePressed(), () => c64.game.go("game"));
  }
});

c64.game.scene("game", {
  enter() { level1.activate({ draw: true }); },
  update() { player.update(); }
});

c64.game.start("title", { hz: 50 });
""")
P("<font name='Consolas'>enter()</font> est exécuté à l'entrée de la scène. <font name='Consolas'>update()</font> est sa boucle. <font name='Consolas'>game.go()</font> programme une transition sûre entre deux frames.")
H2("10.2 Stratégie mémoire D64")
bullets([
    "Gardez le joueur, les routines communes et l'interface dans le PRG principal.",
    "Placez les maps et sprites propres à chaque niveau en assets non résidents.",
    "Réutilisez les mêmes adresses RAM pour les ressources qui ne coexistent jamais.",
    "Chargez le niveau suivant pendant une transition ou un écran noir.",
    "Consultez le rapport de build pour vérifier les noms de fichiers disque et les plages mémoire.",
])
callout("Sur une vraie disquette", "Les noms C64 sont courts et normalisés. Utilisez les noms produits par le compilateur et ne renommez pas manuellement les modules de données dans l'image D64.", "orange")


H1("11. Son SID")
H2("11.1 Réglages directs")
guide_table(
    ["Fonction", "Rôle"],
    [
        ["c64.sid.volume(0..15)", "Volume global"],
        ["c64.sid.voice(1..3)", "Sélection d'une voix"],
        ["voice.frequency(valeur)", "Fréquence SID brute"],
        ["voice.pulseWidth(valeur)", "Largeur d'impulsion"],
        ["voice.waveform(type)", "triangle, sawtooth, pulse ou noise"],
        ["voice.attackDecay(v)", "Enveloppe attaque/décroissance"],
        ["voice.sustainRelease(v)", "Enveloppe maintien/relâchement"],
        ["voice.gate(true/false)", "Démarre ou arrête la note"],
    ],
    [78 * mm, 86 * mm]
)
H2("11.2 Musique et bruitages non bloquants")
code(r"""
c64.sid.volume(12);
c64.sid.playSong({
  tempo: 6,
  voices: [
    ["C4", "E4", "G4", "E4"],
    ["C3", "R", "G2", "R"],
    ["R", "C5", "R", "G4"]
  ]
});

c64.sid.click();
""")
P("Le lecteur musical et les effets sont pilotés par IRQ ou par un runtime partagé. Les effets prêts à l'emploi ne doivent pas arrêter la balle, le joueur ou la boucle de jeu.")
bullets([
    "Réservez une voix aux effets dans un jeu avec musique.",
    "Utilisez les instruments et patterns pour réduire les tables répétées.",
    "Consultez la section <b>sid-audio</b> du rapport de build pour les conflits de voix.",
])


H1("12. IRQ raster et assembleur bas niveau")
H2("12.1 IRQ raster")
code(r"""
c64.irq.raster(100, () => {
  c64.borderColor(c64.COLOR_RED);
});

c64.irq.install();
""")
guide_table(
    ["API", "Utilité"],
    [
        ["c64.irq.raster(ligne, fn)", "Ajoute une action à une ligne raster"],
        ["c64.irq.rasterLoop(ligne, fn, options)", "Effet raster répété et stabilisé"],
        ["c64.irq.install()", "Installe le dispatcher IRQ"],
        ["c64.irq.chainToKernal()", "Conserve le traitement IRQ du KERNAL"],
        ["c64.irq.disableKernalTimer()", "Évite les IRQ CIA concurrentes dans un moteur raster"],
        ["c64.irq.ack()", "Acquitte manuellement une IRQ dans un usage avancé"],
    ],
    [78 * mm, 86 * mm]
)
H2("12.2 Assembleur 6502 dans le JavaScript")
code(r"""
c64.asm.label("change_border");
c64.asm.lda(c64.imm(c64.COLOR_BLUE));
c64.asm.sta(c64.abs(c64.VIC_BORDER_COLOR));
c64.asm.rts();
""")
P("Les helpers d'adressage les plus courants sont <font name='Consolas'>imm()</font>, <font name='Consolas'>abs()</font>, <font name='Consolas'>absX()</font>, <font name='Consolas'>zp()</font> et <font name='Consolas'>rel()</font>. Réservez cette couche aux effets ou routines absents de l'API haut niveau.")
callout("Conseil", "Commencez par l'API de jeu. Descendez vers <font name='Consolas'>c64.asm</font> seulement après avoir isolé une routine courte et mesuré son intérêt.", "green")


H1("13. Optimisation et débogage")
H2("13.1 Choisir le profil")
guide_table(
    ["Profil", "Quand l'utiliser"],
    [
        ["balanced", "Choix par défaut : bon compromis taille/vitesse"],
        ["size", "Quand la taille du PRG ou des modules D64 est prioritaire"],
        ["speed", "Quand le temps CPU ou le démarrage compte plus que la taille"],
    ],
    [38 * mm, 126 * mm]
)
code(r"""
npx c64js build .\examples\platformer-mini.js `
  -o .\build\platformer-mini.prg `
  --opt balanced --report .\build\platformer-mini-report.json
""")
H2("13.2 Lire les sorties de diagnostic")
bullets([
    "<b>ASM</b> : routines et labels générés.",
    "<b>LST</b> : adresse exacte, octets et instruction de chaque ligne.",
    "<b>symbols.json</b> : adresses des labels pour le moniteur VICE.",
    "<b>report.json</b> : taille, plages RAM, RLE, IRQ, sprites, maps, SID et conflits.",
])
H2("13.3 Erreurs courantes")
guide_table(
    ["Message ou symptôme", "Vérification"],
    [
        ["c64js n'est pas reconnu", "Utiliser node .\\src\\cli.js ou npx c64js"],
        ["Cannot find module src/cli.js", "Vérifier Get-Location et revenir dans le bon dossier"],
        ["Le fichier source est introuvable", "Tester Get-ChildItem .\\examples\\nom.js"],
        ["Le jeu ne réagit pas", "Vérifier le port joystick, game.frame() et player.update()"],
        ["PC bloqué dans VICE", "Ouvrir le LST à l'adresse du PC et inspecter la boucle"],
        ["Disk error", "Reconstruire la D64 et ne pas renommer ses modules"],
        ["Sprite coupé ou absent", "Vérifier Y, multiplexage et limite de 8 sprites par raster"],
        ["Collision décalée", "Vérifier hitbox, offset et vitesse maximale de collision"],
    ],
    [68 * mm, 96 * mm]
)


H1("14. Référence rapide des fonctions")
P("Cette référence regroupe les fonctions les plus utiles. Les options avancées et signatures exhaustives restent documentées dans <b>MODE_EMPLOI_DEBUTANT.txt</b> et <b>README.md</b>.")
H2("14.1 Écran et système")
guide_table(
    ["Fonction", "Résumé"],
    [
        ["clearScreen", "Effacer l'écran"], ["borderColor", "Couleur de bordure"],
        ["backgroundColor", "Couleur de fond"], ["textColor", "Couleur texte"],
        ["print / printAt / printCentered", "Afficher du texte"], ["waitKey", "Attendre une touche dans un programme simple"],
        ["writeChar", "Écrire un code écran"], ["fillRect / drawFrame / clearLine", "Dessiner l'interface texte"],
        ["screen / colorRam", "Changer les adresses vidéo utilisées"], ["sys", "Appeler une adresse machine"],
        ["label / comment", "Annoter le code généré"],
    ], [70 * mm, 94 * mm]
)
H2("14.2 Données, variables et contrôle")
guide_table(
    ["Famille", "Fonctions principales"],
    [
        ["c64.data", "byte, word, string, screenString, length"],
        ["c64.var", "byte, word, bool"],
        ["c64.table", "byte et accès indexé runtime"],
        ["c64.control", "if, while, routine, call"],
        ["c64.game", "init, frame, every, scene, go, start, score, lives"],
        ["c64.random", "seed, range"],
        ["c64.pool", "fixed"],
    ], [46 * mm, 118 * mm]
)
H2("14.3 Entrées, sprites et collisions")
guide_table(
    ["Famille", "Fonctions principales"],
    [
        ["c64.input.joystick", "left, right, up, down, fire, firePressed, fireReleased"],
        ["c64.input.keyboard", "touches nommées, down, pressed, released"],
        ["c64.sprite", "create, position, color, enable, disable"],
        ["sprite logique", "setPosition, setVelocity, update, play, collides, respawn"],
        ["collision map", "moveAndCollide, contacts, collisionBehaviors"],
    ], [48 * mm, 116 * mm]
)
H2("14.4 Assets, maps et caméra")
guide_table(
    ["Fonction", "Résumé"],
    [
        ["assets.loadMap / defineMap", "Charger ou définir une map"],
        ["assets.loadSprite / defineSprite", "Charger ou définir un sprite asset"],
        ["charset.use", "Installer un charset RAM avec caractères ROM 0-63 automatiques"],
        ["map.draw / level.map(x,y)", "Dessiner, lire et modifier les tiles"],
        ["level.activate / isActive", "Changer de niveau en inline ou D64"],
        ["map.spawn", "Créer une entité depuis un objet de map"],
        ["map.scroller", "Créer une caméra X/Y avec panneau IRQ"],
        ["camera.draw / follow / left / right / up / down", "Dessiner, suivre et déplacer la caméra"],
    ], [70 * mm, 94 * mm]
)
H2("14.5 Son, IRQ et assembleur")
guide_table(
    ["Famille", "Fonctions principales"],
    [
        ["c64.sid", "volume, filter, voice, note, rest, playSong, stopSong, click, effets"],
        ["c64.irq", "raster, rasterLoop, install, chainToKernal, disableKernalTimer, ack"],
        ["c64.asm", "lda, sta, adc, sbc, and, ora, eor, cmp, branches, jmp, jsr, rts, byte, label"],
        ["adressage", "imm, abs, absX, absY, zp, zpX, ind, indY, rel, immLo, immHi"],
    ], [45 * mm, 119 * mm]
)


H1("15. Méthode conseillée pour votre premier jeu")
H2("15.1 Progression en sept petites étapes")
guide_table(
    ["Étape", "Objectif vérifiable"],
    [
        ["1", "Afficher un écran fixe et produire PRG + ASM"],
        ["2", "Lire le joystick dans game.frame()"],
        ["3", "Déplacer un sprite avec limites"],
        ["4", "Ajouter une collision et un score"],
        ["5", "Ajouter une map créée dans le Studio"],
        ["6", "Ajouter scrolling, panneau fixe et son"],
        ["7", "Séparer title, game et gameOver, puis produire une D64 si nécessaire"],
    ], [20 * mm, 144 * mm]
)
H2("15.2 Checklist avant de continuer")
bullets([
    "Le PRG se lance dans VICE sans blocage.",
    "Le joystick est lu sur le bon port.",
    "La boucle reste courte et toutes les boucles runtime sont bornées.",
    "Les coordonnées, hitboxes et collisions sont testées aux quatre directions.",
    "Le texte reste lisible avec le charset personnalisé.",
    "Le rapport ne signale aucun conflit mémoire ni dépassement raster.",
    "Les sorties ASM et LST sont conservées avec chaque build important.",
])
callout("Le meilleur réflexe", "Ajoutez une seule fonction à la fois, compilez, testez dans VICE, puis seulement ensuite passez à l'étape suivante. C'est la manière la plus rapide de comprendre où apparaît un défaut.", "green")
P("Fin du guide condensé. Pour les signatures complètes, les contraintes exactes et les exemples spécialisés, consultez les fichiers <b>MODE_EMPLOI_DEBUTANT.txt</b>, <b>README.md</b> et le dossier <b>examples/</b> du projet.", "SmallGuide")


OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.multiBuild(story)
print(OUTPUT)
