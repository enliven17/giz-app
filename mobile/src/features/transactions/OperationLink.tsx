import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import { Button } from "@/components/atoms/Button";
import { useTransactions } from "./TransactionProvider";
export function OperationLink() {
  const { operation } = useTransactions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return operation ? (
    <Button
      label={`View operation · ${operation.phase}`}
      variant="secondary"
      onPress={() => navigation.navigate("Transaction", { resume: true })}
    />
  ) : null;
}
