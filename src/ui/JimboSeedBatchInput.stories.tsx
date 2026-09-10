import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryScene } from "../../.storybook/StoryScene.js";
import { JimboSeedBatchInput } from "./JimboSeedBatchInput.js";

const meta: Meta<typeof JimboSeedBatchInput> = {
  title: "Primitives/Inputs/JimboSeedBatchInput",
  component: JimboSeedBatchInput,
};
export default meta;

type Story = StoryObj<typeof JimboSeedBatchInput>;

const SEEDS_100 = [
  "5PZP86N2", "WQIEXML1", "T3I6PYE3", "AMGBRNF3", "1R8FK2W3",
  "8AL42HO1", "3Q3OGZ82", "PAQ7V7J1", "YXFUWM92", "DFUKPPE2",
  "YM7JKOS1", "IMJOQPZ1", "M7X1HYH3", "O1LBK6F4", "1PWJ4YI2",
  "2WMFNE52", "GMX3AKK2", "3VS5VI81", "841SY732", "3RNUI9T1",
  "7ZXJ4W22", "71QLPZE2", "ANC75611", "IIJPFKW2", "LQ365QJ3",
  "SJPCHY61", "OMOANV53", "OXRF8QW2", "63ABCOL2", "UY8TC3G3",
  "KR68Q8C4", "KNYA9VJ1", "VNJQB6C2", "3C7UC3M1", "8I3PDS82",
  "9JCSPEQ1", "GI3EHDY1", "XIAORG72", "H81PW9Y2", "N3XW8R93",
  "QB4XQ2Y1", "H5ZARB53", "27KES9P2", "AM1MNZG1", "2DHJPO73",
  "TFERYWP1", "13TUAJS2", "LSXKUJR2", "X74L9IC3", "LVAEEBL3",
  "ARN9RKJ2", "IMM4LD93", "XVQO63Z3", "64I74EF2", "XDOH66C4",
  "LZAMP1I2", "F7S5P3C4", "TMQX5RN2", "YI4KCO63", "2F4OJ5E4",
  "4C8S9IX2", "FOTYH6D3", "QS5ESPF3", "U5I9P9U2", "ICZ3YB91",
  "U9RLUCE3", "89SO87I3", "KJ37O273", "5CO72L12", "KK96OAM1",
  "LONL8I23", "ORV6QY31", "1FFM59I2", "BH318711", "NZEXQQ22",
  "16CMNXP2", "228H4CP1", "2HAWB191", "834VCPJ3", "C5TXCZY1",
  "UGBRMNA2", "DHUGVZO1", "JZAGK8Y1", "6DR6K564", "T1RXFPU1",
  "WSVMX371", "XKQPX1A1", "2D78P462", "UY72SR51", "HW52HR91",
  "84EHK5O2", "KGBY8NE2", "O54Y3M41", "J3K2E5R3", "9SUKDHD3",
  "R2BPVY53", "ZH9E3PE1", "A1D764J3", "3RC5KDL3", "1G6V5H23",
  "K2P7HNY3", "AYUESV63", "2ELMOHD3", "CXLZJF83", "HOW4UQA1",
  "XVGF4WX2", "ANJYOTH2", "EA6KGSS2", "NLE7RW23",
].join("\n");

export const Empty: Story = {
  render: () => (
    <StoryScene>
      <JimboSeedBatchInput
        ready
        onAnalyze={(seeds) => console.log("analyze", seeds)}
      />
    </StoryScene>
  ),
};

export const WithSeeds: Story = {
  render: () => (
    <StoryScene>
      <JimboSeedBatchInput
        ready
        defaultText={SEEDS_100}
        onAnalyze={(seeds) => console.log("analyze", seeds.length)}
      />
    </StoryScene>
  ),
};

export const InjectMode: Story = {
  render: () => {
    const [saved, setSaved] = useState<string[]>([]);
    return (
      <StoryScene>
        <JimboSeedBatchInput
          ready
          defaultText={SEEDS_100}
          onAnalyze={(seeds) => console.log("analyze", seeds.length)}
          onInjectIntoJaml={(seeds) => setSaved(seeds)}
        />
        {saved.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <JimboSeedBatchInput
              ready
              defaultText={`Saved ${saved.length} seeds to filter document.`}
              onAnalyze={() => {}}
            />
          </div>
        )}
      </StoryScene>
    );
  },
};

export const NotReady: Story = {
  render: () => (
    <StoryScene>
      <JimboSeedBatchInput
        ready={false}
        defaultText={SEEDS_100}
        onAnalyze={(seeds) => console.log("analyze", seeds.length)}
      />
    </StoryScene>
  ),
};

export const Running: Story = {
  render: () => (
    <StoryScene>
      <JimboSeedBatchInput
        ready
        running
        defaultText={SEEDS_100}
        onAnalyze={(seeds) => console.log("analyze", seeds.length)}
      />
    </StoryScene>
  ),
};

export const MixedInput: Story = {
  render: () => (
    <StoryScene>
      <JimboSeedBatchInput
        ready
        defaultText={`Some header text that is not a seed
WEEJOKER
18Z47K9Q
bad!!!
Q1J3A11E
http://example.com/seed/TEST1234
partial
OK`}
        onAnalyze={(seeds) => console.log("analyze", seeds)}
      />
    </StoryScene>
  ),
};
