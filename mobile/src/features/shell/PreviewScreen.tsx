import { Badge } from "@/components/atoms/Badge";
import { IconButton } from "@/components/atoms/IconButton";
import { GroupedRow } from "@/components/molecules/GroupedRow";
import { Surface } from "@/components/molecules/Surface";
import { Info } from "lucide-react-native";
import { BackAction } from "@/navigation/BackAction";
import { useState } from "react";
import { View } from "react-native";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Notice } from "@/components/molecules/Notice";
import { Metric } from "@/components/molecules/Metric";
import { MetricGroup } from "@/components/molecules/MetricGroup";
import { SnapshotStatus } from "@/components/molecules/SnapshotStatus";
import { Choice } from "@/components/molecules/Choice";
import { VaultList } from "@/components/organisms/VaultList";
import { useInvestments } from "@/features/investments/InvestmentProvider";
import { GlitchText } from "@/components/atoms/GlitchText";
import { smoothGlitchWordmark } from "@/animations/smoothGlitchWordmark";
export function PreviewScreen() {
  const [selected, setSelected] = useState(false);
  const [feedback, setFeedback] = useState(
    "Examples only — these controls do not change your account.",
  );
  const { data } = useInvestments();
  return (
    <Screen>
      <BackAction fallback="Settings" />
      <Typography variant="heading">UI preview</Typography>
      <Typography variant="label">Pixel glitch</Typography>
      <GlitchText />
      <Typography variant="label">Clean type glitch</Typography>
      <GlitchText
        source={smoothGlitchWordmark}
        accessibilityLabel="Animated smooth Gizu glitch wordmark"
        testID="gizu-smooth-glitch-animation"
        text="GIZU"
      />
      <Metric emphasis label="Example portfolio · USD" value="$810,838.24" />
      <MetricGroup
        metrics={[
          { label: "APY", value: "18.4%" },
          { label: "Lockup", value: "30 days" },
        ]}
      />
      <Surface>
        <GroupedRow label="Example grouped row" value="USD" detail="Supporting information" />
      </Surface>
      <View className="flex-row flex-wrap gap-3">
        <Badge label="+3.84%" />
        <Badge label="-1.84%" negative />
        <IconButton
          icon={Info}
          label="Preview information"
          onPress={() => setFeedback("Information action previewed.")}
        />
      </View>
      <Typography variant="heading">Actions</Typography>
      <Button label="Primary example" onPress={() => setFeedback("Primary action previewed.")} />
      <Button
        label="Secondary example"
        variant="secondary"
        onPress={() => setFeedback("Secondary action previewed.")}
      />
      <Button
        label="Quiet example"
        variant="quiet"
        onPress={() => setFeedback("Quiet action previewed.")}
      />
      <Button
        label="Destructive example"
        variant="destructive"
        onPress={() => setFeedback("Destructive style previewed. Nothing was deleted.")}
      />
      <Button label="Disabled action" disabled onPress={() => {}} />
      <Button label="Loading action" loading onPress={() => {}} />
      <Typography accessibilityLiveRegion="polite">{feedback}</Typography>
      <Typography variant="heading">Filters and empty states</Typography>
      <View className="flex-row flex-wrap gap-2">
        <Choice
          label="Example risk filter"
          selected={selected}
          onPress={() => setSelected(!selected)}
        />
      </View>
      <Notice message="No vaults match your filters. Try a different search." />
      <Typography variant="heading">Snapshot states</Typography>
      <SnapshotStatus
        asOf="Example timestamp"
        freshness="stale"
        loading={false}
        error={null}
        onRefresh={() => setFeedback("Refresh previewed.")}
      />
      <SnapshotStatus
        freshness="offline"
        loading={false}
        error="Example connection failure."
        onRefresh={() => setFeedback("Retry previewed.")}
      />
      <Notice error message="Example error — no operation was submitted." />
      <Typography variant="heading">Vault card</Typography>
      <VaultList
        vaults={data?.vaults.slice(0, 1) ?? []}
        onOpen={() => setFeedback("Vault card previewed.")}
      />
    </Screen>
  );
}
