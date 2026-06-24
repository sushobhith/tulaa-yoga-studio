/* =========================================================
   Antara / Tulaa — colour palettes.
   Shared by the live site (app.js applies the chosen one)
   and the /admin editor (shows them as pickable swatches).
   Each palette overrides the CSS variables in styles.css.
   `swatch` = [background, accent, ink] shown in the editor.
   ========================================================= */
window.THEMES = {
  sage: {
    label: "Sage (default)",
    swatch: ["#FBF8F3", "#6E7257", "#262420"],
    vars: {
      "--ivory": "#F5F1EA", "--paper": "#FBF8F3", "--sand": "#EDE7DB",
      "--ink": "#262420", "--muted": "#6F6857",
      "--olive": "#6E7257", "--olive-deep": "#565a43",
      "--brass": "#A88B5C", "--line": "#E3DACB"
    }
  },
  terracotta: {
    label: "Terracotta",
    swatch: ["#FCF7F2", "#B25C43", "#2B2420"],
    vars: {
      "--ivory": "#F6EFE9", "--paper": "#FCF7F2", "--sand": "#EFE2D8",
      "--ink": "#2B2420", "--muted": "#7A6A5E",
      "--olive": "#B25C43", "--olive-deep": "#8E4632",
      "--brass": "#C08A5A", "--line": "#E8D8CC"
    }
  },
  ocean: {
    label: "Ocean",
    swatch: ["#F8FBFA", "#3E6E73", "#1F2A28"],
    vars: {
      "--ivory": "#EEF2F1", "--paper": "#F8FBFA", "--sand": "#DEE7E5",
      "--ink": "#1F2A28", "--muted": "#5E716E",
      "--olive": "#3E6E73", "--olive-deep": "#2C5256",
      "--brass": "#6FA09E", "--line": "#D2DEDB"
    }
  },
  charcoal: {
    label: "Charcoal",
    swatch: ["#FAFAF8", "#3A3A37", "#232220"],
    vars: {
      "--ivory": "#F2F1EE", "--paper": "#FAFAF8", "--sand": "#E4E2DD",
      "--ink": "#232220", "--muted": "#6A655E",
      "--olive": "#3A3A37", "--olive-deep": "#232321",
      "--brass": "#9C8866", "--line": "#DCD9D2"
    }
  },
  sand: {
    label: "Warm Sand",
    swatch: ["#FBF6EC", "#A8824A", "#2A2519"],
    vars: {
      "--ivory": "#F5EFE3", "--paper": "#FBF6EC", "--sand": "#ECE2CF",
      "--ink": "#2A2519", "--muted": "#756B54",
      "--olive": "#A8824A", "--olive-deep": "#846235",
      "--brass": "#C0A063", "--line": "#E5D8BF"
    }
  }
};
