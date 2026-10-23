// domAnimation covers animate/exit/variants. Layout animations (domMax) are deliberately not
// loaded: they add ~45 KB gzipped, and the navigation indicator uses a CSS transform instead.
import { domAnimation } from "motion/react";

export default domAnimation;
