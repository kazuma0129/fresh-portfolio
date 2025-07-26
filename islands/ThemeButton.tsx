import { useDarkTheme } from "../hooks/useDarkTheme.ts";

export default () => {
  const { toggle } = useDarkTheme();
  return (
    <div>
      <h1>
        <button
          type="button"
          onClick={() => toggle()}
        >
          <span>@kazuma0129</span>
        </button>
      </h1>
    </div>
  );
};
