import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/theme";
import { fetchJobs, type JobPosting } from "./src/api";

export default function App() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      setJobs(await fetchJobs(q));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.brand}>
          İş<Text style={{ color: colors.gold }}>Kalkan</Text>
        </Text>
        <Text style={styles.subtitle}>Güvenilir iş ve hizmet platformu</Text>
      </View>

      {/* Arama */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="İş ara (ör. muhasebe, kurye...)"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => load(query)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => load(query)}>
          <Text style={styles.searchBtnText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {/* İçerik */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.emerald} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={() => load(query)}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => load(query)} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Şu an gösterilecek ilan yok.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {(item.company?.name ?? "Firma")}
                {item.city ? ` · ${item.city}` : ""}
                {item.workType ? ` · ${item.workType}` : ""}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  brand: { color: colors.white, fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#B8C4D6", marginTop: 2, fontSize: 13 },
  searchRow: { flexDirection: "row", padding: 16, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  searchBtn: {
    backgroundColor: colors.emerald,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  searchBtnText: { color: colors.white, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardMeta: { marginTop: 4, color: colors.muted, fontSize: 13 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  error: { color: "#DC2626", textAlign: "center", marginBottom: 12 },
  retry: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: colors.white, fontWeight: "700" },
});
