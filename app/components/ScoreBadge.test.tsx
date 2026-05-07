import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ScoreBadge from "~/components/ScoreBadge";

describe("ScoreBadge", () => {
  it('shows "Strong" when score is above 70', () => {
    render(<ScoreBadge score={85} />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it('shows "Good Start" for mid range', () => {
    render(<ScoreBadge score={60} />);
    expect(screen.getByText("Good Start")).toBeInTheDocument();
  });

  it('shows "Needs Work" when score is 49 or below', () => {
    render(<ScoreBadge score={40} />);
    expect(screen.getByText("Needs Work")).toBeInTheDocument();
  });
});
