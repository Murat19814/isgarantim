import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/theme";
import { fetchJobs, jobWebUrl, type JobPosting } from "./src/api";

function formatTRY(n?: number | null): string | null {
  if (n == null) return null;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function App() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<JobPosting | null>(null);

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

  // ── İş detayı ekranı ───────────────────────────────
  if (selected) {
    const salary =
      formatTRY(selected.salaryMin) || formatTRY(selected.salaryMax)
        ? `${formatTRY(selected.salaryMin) ?? "?"} - ${formatTRY(selected.salaryMax) ?? "?"}`
        : null;
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={styles.back}>‹ Geri</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{selected.title}</Text>
          <Text style={styles.subtitle}>
            {(selected.company?.name ?? "Firma")}
            {selected.city ? ` · ${selected.city}` : ""}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.metaRow}>
            {selected.workType && <Badge text={selected.workType} />}
            {salary && <Badge text={salary} gold />}
          </View>

          <Text style={styles.sectionTitle}>İlan açıklaması</Text>
          <Text style={styles.body}>
            {selected.description?.trim() || "Bu ilan için açıklama girilmemiş."}
          </Text>

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => Linking.openURL(jobWebUrl(selected.id))}
          >
            <Text style={styles.applyBtnText}>İlanı sitede aç & başvur</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            Başvuru için isgarantim.com hesabınla giriş yapman gerekir.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── İş listesi ekranı ──────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.brand}>
          İş<Text style={{ color: colors.gold }}>Kalkan</Text>
        </Text>
        <Text style={styles.subtitle}>Güvenilir iş ve hizmet platformu</Text>
      </View>

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
            <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {(item.company?.name ?? "Firma")}
                {item.city ? ` · ${item.city}` : ""}
                {item.workType ? ` · ${item.workType}` : ""}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function Badge({ text, gold }: { text: string; gold?: boolean }) {
  return (
    <View style={[styles.badge, gold && { backgroundColor: "#FBF3D9" }]}>
      <Text style={[styles.badgeText, gold && { color: "#8A6D1B" }]}>{text}</Text>
    </View>
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
  detailTitle: { color: colors.white, fontSize: 20, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#B8C4D6", marginTop: 2, fontSize: 13 },
  back: { color: colors.gold, fontSize: 16, fontWeight: "700" },
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
  metaRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge: {
    backgroundColor: "#E3F5EE",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: { color: colors.emeraldDark, fontWeight: "700", fontSize: 12 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  body: { color: "#334155", fontSize: 14, lineHeight: 21 },
  applyBtn: {
    backgroundColor: colors.emerald,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
  },
  applyBtnText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  hint: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 8 },
});
