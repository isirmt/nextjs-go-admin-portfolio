import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LabelText } from "./labelBlock";

const meta = {
  component: LabelText,
} satisfies Meta<typeof LabelText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "ラベル",
  },
};

export const Required: Story = {
  args: {
    children: "タイトル",
    required: true,
  },
};