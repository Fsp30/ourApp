import { useTheme } from "@/constants/ThemeContext";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

export function Background({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    if (!theme.backgroundImage) {
        return (
            <View style={[styles.fill, { backgroundColor: theme.background }]}>
                {children}
            </View>
        );
    }

    return (
        <View style={styles.fill}>
            <Image
                source={theme.backgroundImage}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                contentPosition={"center"}
            />
            <BlurView
                intensity={theme.blurIntensity}
                tint={theme.blurTint}
                style={styles.fill}
            >
                {children}
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
});
