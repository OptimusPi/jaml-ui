import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryScene } from "../../.storybook/StoryScene.js";
import {
  JimboPicker,
  JimboPickerEmpty,
  JimboPickerGrid,
  JimboPickerHint,
  JimboPickerItem,
  JimboPickerSearch,
  JimboPickerSection,
} from "./JimboPicker.js";
import { JimboText } from "./jimboText.js";
import { JimboTextInput } from "./JimboTextInput.js";

const meta: Meta = {
  title: "Primitives/Inputs/JimboPicker",
};
export default meta;

export const JokerMust: StoryObj = {
  name: "Pick a joker for Must",
  render: () => (
    <StoryScene title="Must" tone="red">
      <JimboPicker>
        <JimboPickerSection>
          <JimboPickerSearch>
            <JimboTextInput placeholder="Search..." style={{ width: "100%" }} />
          </JimboPickerSearch>
          <JimboPickerHint>Type to filter, or pick "Any"</JimboPickerHint>
          <JimboPickerGrid>
            <JimboPickerItem>Blueprint</JimboPickerItem>
            <JimboPickerItem>Brainstorm</JimboPickerItem>
            <JimboPickerItem muted>Perkeo</JimboPickerItem>
          </JimboPickerGrid>
        </JimboPickerSection>
      </JimboPicker>
    </StoryScene>
  ),
};

export const NoHits: StoryObj = {
  name: "Picker with no matches",
  render: () => (
    <StoryScene title="Must" tone="red">
      <JimboPicker>
        <JimboPickerSearch>
          <JimboTextInput defaultValue="zzz" placeholder="Search..." style={{ width: "100%" }} />
        </JimboPickerSearch>
        <JimboPickerEmpty>
          <JimboText size="sm" tone="grey">
            No matches
          </JimboText>
        </JimboPickerEmpty>
      </JimboPicker>
    </StoryScene>
  ),
};
