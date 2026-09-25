import { useSession } from "@/application/SessionProvider";
import { Switch, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import type { StatementFrequency } from "@/domain/preferences";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Surface } from "@/components/molecules/Surface";
import { GroupedRow } from "@/components/molecules/GroupedRow";
import { PreferenceOption } from "@/components/molecules/PreferenceOption";
import { BackAction } from "@/navigation/BackAction";
import colors from "@/theme/colors.json";
import { useAccount } from "./AccountProvider";
import { AccountAddress } from "./AccountAddress";
import { PreferenceFeedback } from "./PreferenceFeedback";
import { informationPages, nativeInformationPages } from "./pages";
const frequencies: StatementFrequency[] = ["Monthly", "Quarterly", "On request"];
export function AccountPageScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, "AccountPage">) {
  const { preferences, loading, busy, save } = useAccount();
  const page = route.params.page;
  const { session } = useSession();
  const native = session?.kind === "testnet";
  const info = (native ? nativeInformationPages[page] : undefined) ?? informationPages[page];
  const unavailable = loading || busy || !preferences;
  return (
    <Screen>
      <BackAction fallback="Settings" />
      {info ? (
        <>
          <Typography variant="title">{info.title}</Typography>
          <Typography>{info.body}</Typography>
          <Surface>
            {info.rows.map((row) => (
              <GroupedRow key={row.label} {...row} />
            ))}
          </Surface>
          {page === "passkey-wallet" && (
            <Surface>
              <AccountAddress />
            </Surface>
          )}
          {info.actions?.map((label) => (
            <Button key={label} label={label} disabled onPress={() => {}} />
          ))}
        </>
      ) : page === "alerts" ? (
        <>
          <Typography variant="title">Push alerts</Typography>
          <Typography>
            Save your alert preference on this device. Push registration and delivery are not
            available yet; this setting does not request system permission.
          </Typography>
          <PreferenceFeedback />
          <Surface>
            <View className="flex-row flex-wrap items-center justify-between gap-4 p-5">
              <Typography variant="row">Receive push alerts</Typography>
              <Switch
                accessible
                accessibilityRole="switch"
                accessibilityLabel="Receive push alerts"
                accessibilityState={{
                  checked: preferences?.alerts ?? false,
                  disabled: unavailable,
                }}
                value={preferences?.alerts ?? false}
                disabled={unavailable}
                trackColor={{ true: colors.accent }}
                onValueChange={(alerts) => void save({ alerts })}
              />
            </View>
          </Surface>
          <Typography variant="caption">
            {native
              ? "The inbox is not connected yet."
              : "The in-app inbox remains available regardless of this preference."}
          </Typography>
        </>
      ) : page === "currency" ? (
        <>
          <Typography variant="title">Currency</Typography>
          <Typography>
            {native
              ? "Balances are shown in MON. Fiat valuation is unavailable until a pricing service is connected."
              : "USD is the supported display currency. EUR, GBP and TRY will become available when exchange-rate data is connected. Orders and transfers retain their stated asset units."}
          </Typography>
          <PreferenceFeedback />
          <Surface>
            {(native ? ["MON"] : ["USD", "EUR", "GBP", "TRY"]).map((currency) => (
              <PreferenceOption
                key={currency}
                label={currency}
                selected={currency === (native ? "MON" : "USD")}
                disabled
                onSelect={() => {}}
              />
            ))}
          </Surface>
        </>
      ) : page === "statements" ? (
        <>
          <Typography variant="title">Statements</Typography>
          <Typography>
            Choose a preferred frequency. Delivery, statement requests and the document archive are
            not available yet.
          </Typography>
          <PreferenceFeedback />
          <Typography variant="heading">Preferred frequency</Typography>
          <Surface>
            {frequencies.map((frequency) => (
              <PreferenceOption
                key={frequency}
                label={frequency}
                selected={preferences?.statements === frequency}
                disabled={unavailable}
                onSelect={() => void save({ statements: frequency })}
              />
            ))}
          </Surface>
          <Typography variant="heading">Archive</Typography>
          <Typography>No statements available.</Typography>
          <Button label="Request statement" disabled onPress={() => {}} />
        </>
      ) : (
        <>
          <Typography variant="title">Page unavailable</Typography>
          <Typography>This account page is not supported.</Typography>
        </>
      )}
    </Screen>
  );
}
