import { stageBackground, stageFrame } from "@/lib/stage";
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

  it("gives every case card a gradient with at least two stops", () => {
    for (const study of buildCaseStudies()) {
      expect(study.stageGradient?.stops.length, study.id).toBeGreaterThanOrEqual(2);
    }
  });
});
