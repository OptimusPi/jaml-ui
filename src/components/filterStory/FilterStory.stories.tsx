import type { Meta, StoryObj } from "@storybook/react-vite";
import { appMeta } from "../../../.storybook/appFrame.js";
import { FilterStory } from "./FilterStory.js";
import source from "./simpleCola.jaml?raw";

const meta = {
  ...appMeta("desktop"),
  title: "Apps/Filter Story",
  component: FilterStory,
} satisfies Meta<typeof FilterStory>;

export default meta;
type Story = StoryObj<typeof FilterStory>;

/** pifreak's Diet Cola filter, rendered as the story it is. */
export const SimpleCola: Story = {
  args: {
    source,
    crowns: [
      "T8ANALX8",
      "TITSGOFG",
      "PISSTYVB",
      "G1ZECUMS",
      "XIT5CUMS",
      "6FAGS3GH",
      "2M8CUMSI",
      "95GQFUCK",
      "GMDONGIV",
    ],
  },
};
