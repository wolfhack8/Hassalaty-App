@import "tailwindcss";

:root { --ink: #102a43; --green: #087f5b; --lime: #d8f5a2; --cream: #f8fbf6; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--cream); color: var(--ink); font-family: Arial, "Tahoma", sans-serif; }
button, input { font: inherit; }
.shell { max-width: 1120px; margin: 0 auto; padding: 24px; }
.card { border: 1px solid #dce9df; border-radius: 24px; background: white; box-shadow: 0 10px 28px rgb(8 127 91 / 7%); }
.navlink { border-radius: 999px; padding: 9px 14px; font-size: 14px; font-weight: 700; color: #38604d; }
.navlink:hover { background: #e6f7ed; color: #087f5b; }
