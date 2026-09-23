import { useState } from "react";
import { View } from "react-native";
import { Screen } from "@/components/templates/Screen";
import { Typography } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { Surface } from "@/components/molecules/Surface";
import { GroupedRow } from "@/components/molecules/GroupedRow";
import { BackAction } from "@/navigation/BackAction";
import { useNotifications } from "./NotificationProvider";
export function NotificationsScreen() {
  const { items, loading, busy, error, reload, mark, unread } = useNotifications();
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Screen>
      <BackAction fallback="Home" />
      <Typography variant="title">Notifications</Typography>
      <Typography accessibilityLiveRegion="polite">{unread} unread</Typography>
      <Button
        label="Mark all as read"
        disabled={loading || busy || unread === 0}
        onPress={() =>
          void mark(
            items.filter((item) => !item.read).map((item) => item.id),
            true,
          )
        }
      />
      {loading && <Typography>Loading notifications…</Typography>}
      {error && <Typography accessibilityRole="alert">{error}</Typography>}
      <Button
        label={error ? "Retry notifications" : "Refresh notifications"}
        variant="quiet"
        disabled={loading || busy}
        onPress={() => void reload()}
      />
      {!loading && !error && items.length === 0 && <Typography>No notifications yet.</Typography>}
      {items.map((item) => (
        <Surface key={item.id}>
          <GroupedRow
            label={item.title}
            value={item.read ? "Read" : "Unread"}
            detail={`${item.category} · ${item.time}`}
            disabled={busy || loading}
            accessibilityLabel={`${item.title}, ${item.read ? "read" : "unread"}`}
            onPress={() => {
              setOpened(item.id);
              if (!item.read) void mark([item.id], true);
            }}
          />
          {opened === item.id && (
            <View className="gap-3 p-5">
              <Typography>{item.body}</Typography>
              <Button
                label={item.read ? "Mark as unread" : "Mark as read"}
                variant="quiet"
                disabled={busy || loading}
                onPress={() => void mark([item.id], !item.read)}
              />
              <Button label="Close notification" variant="quiet" onPress={() => setOpened(null)} />
            </View>
          )}
        </Surface>
      ))}
    </Screen>
  );
}
