import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { useAccount } from "./AccountProvider";
export function PreferenceFeedback() {
  const { loading, busy, error, notice, preferences, reload } = useAccount();
  return (
    <>
      {loading && <Typography>Loading preferences…</Typography>}
      {error && <Typography accessibilityRole="alert">{error}</Typography>}
      {!preferences && !loading && (
        <Button label="Retry preferences" disabled={busy} onPress={() => void reload()} />
      )}
      {notice && <Typography accessibilityLiveRegion="polite">{notice}</Typography>}
    </>
  );
}
