# Skills de Frontend / Diseño — SmartBga Web

Referencia de los skills instalados/disponibles para trabajo de UI, diseño, animación e imagen en este proyecto. Generado el 2026-06-11.

## Blackbox CLI v2 — estado: pendiente

No se pudo instalar. Bloqueo: el script (`https://blackbox.ai/install.sh`) solo soporta Linux/macOS — en Windows con Git Bash (MINGW64) falla por OS no soportado. Se intentó vía WSL Ubuntu, pero falta `unzip` y `apt-get install` requiere contraseña de `sudo` (timeout sin TTY).

**Para retomar:**
```bash
wsl -d Ubuntu
sudo apt-get update && sudo apt-get install -y unzip
curl -fsSL https://blackbox.ai/install.sh | bash
```

Alternativa si solo se busca asistencia de código en frontend: extensión oficial de Blackbox AI para VS Code (funciona nativo en Windows, sin este CLI).

## Skills instalados en este repo (`.agents/skills/`, symlink → Claude Code)

Instalados con `npx skills add <repo>`. Aplican automáticamente en este proyecto.

### Taste / dirección de diseño general
- **design-taste-frontend** (v2, default actual) — skill anti-slop para landing pages, portfolios y rediseños. Lee el brief, infiere la dirección de diseño y evita look "templado". Audit-first en rediseños.
- **design-taste-frontend-v1** — versión original, solo para compatibilidad exacta si algo dependía del comportamiento v1.
- **gpt-taste** — UX/UI elite + GSAP motion avanzado. Randomización de layout, estructura AIDA, tipografía editorial ancha, bento grids sin gaps, ScrollTriggers estrictos (pin/stack/scrub).
- **impeccable** *(Gen: Med Risk, Snyk: Med Risk — revisado 2026-06-11, sin hallazgos maliciosos)* — skill todo-terreno para diseñar/rediseñar/auditar/pulir interfaces: jerarquía visual, accesibilidad, performance, theming, motion, copy UX, design tokens. El riesgo "Med" viene de que es muy autónomo (servidor local de live-preview en `127.0.0.1`, automatiza navegador, auto-edita archivos del proyecto vía `manual-apply`) + 1 check de versión diario a `impeccable.style/api/version` (silencioso, sin enviar datos; desactivable con `IMPECCABLE_NO_UPDATE_CHECK=1`). Autor: pbakaus (Paul Bakaus). Seguro de usar — revisar diffs generados en modo `live`/`craft` antes de commitear.
- **high-end-visual-design** — fuentes, spacing, sombras, cards y animaciones de "agencia cara". Bloquea defaults que se ven genéricos/baratos en IA.
- **redesign-existing-projects** — sube de nivel sitios/apps existentes: audita, detecta patrones genéricos de IA, aplica estándares premium sin romper funcionalidad.
- **minimalist-ui** — interfaces editoriales limpias, monocromo cálido, contraste tipográfico, bento grids planos, sin gradientes ni sombras pesadas.
- **industrial-brutalist-ui** — estética brutalista/industrial (grids rígidos, tipografía Swiss + terminal militar). Para dashboards data-heavy, portfolios o sitios editoriales tipo "blueprint".
- **stitch-design-taste** — genera archivos `DESIGN.md` agent-friendly para Google Stitch: tipografía estricta, color calibrado, layouts asimétricos, micro-motion constante.

### Generación de imágenes / mockups
- **imagegen-frontend-web** — referencias de diseño web premium. Regla clave: 1 imagen horizontal POR sección (landing de 8 secciones = 8 imágenes), variedad de composición y CTAs.
- **imagegen-frontend-mobile** — concepts de pantallas mobile-native (iOS/Android/cross-platform), con mockup de teléfono, jerarquía limpia, paleta controlada.
- **image-to-code** — para Codex: genera imagen de diseño, la analiza a fondo y luego implementa el código fiel a esa imagen. Evita cards-dentro-de-cards y heroes saturados.
- **brandkit** — boards de brand guidelines, sistemas de logo, identity decks. Estilos: minimalista, cinematográfico, editorial, dark-tech, lujo, gaming, dev-tool, consumer-app.

### Motion / animación
- **emil-design-eng** — filosofía de Emil Kowalski sobre pulido de UI, diseño de componentes y decisiones de animación (los detalles invisibles que hacen que el software "se sienta bien").

### Utilidad
- **full-output-enforcement** — fuerza salida de código completa, sin placeholders ni truncado por límite de tokens.

## Skills globales ya disponibles (no requieren instalación, vía Skill tool)

- **ui-ux-pro-max** — inteligencia UI/UX: 67 estilos, 96 paletas, 57 pairings de fuentes, 25 tipos de gráfico, 13 stacks (incluye Next.js, React, Tailwind, shadcn/ui). Cubre plan/build/review/fix de componentes, accesibilidad, layout, animación. Integra MCP de shadcn/ui.
- **design-motion-principles** — experto en motion basado en Emil Kowalski, Jakub Krehel y Jhey Tompkins. Dos modos: construir componentes con motion intencional, o auditar animaciones existentes (genera reporte HTML con demos en loop) para detectar "AI-slop motion".
- **landing-page-design** — landing pages de alta conversión, composición sección por sección, principios anti-AI-slop.

## Cuándo usar cada cosa (guía rápida)

- **Diseñar una sección/página nueva desde cero** → `design-taste-frontend` o `ui-ux-pro-max` (plan/build) según si se quiere algo más "anti-slop libre" vs. sistema con paletas/stacks predefinidos.
- **Animaciones con framer-motion** (ya instalado en este repo) → `design-motion-principles` o `emil-design-eng` para principios; `gpt-taste` si se quiere algo más agresivo tipo GSAP.
- **Auditar/mejorar algo que ya existe** → `redesign-existing-projects` o `impeccable` (revisar riesgo) o modo audit de `design-motion-principles`.
- **Necesitas mockups/imágenes de referencia antes de codear** → `imagegen-frontend-web` (web) / `imagegen-frontend-mobile` (app) / `image-to-code` (imagen → código).
- **Branding / identidad visual** → `brandkit`.
- **Landing page de marketing/lanzamiento** → `landing-page-design`.
- **Estética específica**: minimalista/editorial → `minimalist-ui`; brutalista/industrial/dashboard data-heavy → `industrial-brutalist-ui`.
