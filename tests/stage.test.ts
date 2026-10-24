import { NEUTRAL_STAGE, stageBackground, stageFrame, stageGradientFor } from "@/lib/stage";
import { buildCaseStudies } from "@/lib/caseStudies";

const pink = {
  angle: 145,
  stops: [
    { color: "#831843", at: 0 },
    { color: "#DB2777", at: 40 },
    { color: "#f472b6", at: 75 },
    { color: "#fbcfe8", at: 100 },
  ],
};

describe("case card stage", () => {
  it("renders the gradient as CSS", () => {
    expect(stageBackground(pink)).toBe(
      "linear-gradient(145deg, #831843 0%, #DB2777 40%, #f472b6 75%, #fbcfe8 100%)",
    );
  });

  it("frames the screenshot in the second-lightest stop, by lightness not position", () => {
    expect(stageFrame(pink)).toBe("#f472b6");
    expect(stageFrame({ ...pink, stops: [...pink.stops].reverse() })).toBe("#f472b6");
  });

  it("uses a screenshot card's own gradient and the neutral grey for cards without one", () => {
    for (const study of buildCaseStudies()) {
      if (study.screenshot) {
        expect(study.stageGradient, `${study.id} needs a gradient for its image`).toBeDefined();
        expect(stageGradientFor(study)).toBe(study.stageGradient);
      } else {
        expect(stageGradientFor(study), study.id).toBe(NEUTRAL_STAGE);
      }
    }
    expect(stageBackground(NEUTRAL_STAGE)).toBe(
      "linear-gradient(145deg, #1f2937 0%, #4b5563 40%, #9ca3af 75%, #d1d5db 100%)",
    );
  });
});
