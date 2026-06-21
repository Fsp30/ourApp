import { View, StyleSheet } from "react-native";

const SIZE = 64;

interface PostItGlyphProps {
    color: string;
}

export function PostItGlyph({ color }: PostItGlyphProps) {
    return (
        <View
            style={[
                styles.paper,
                { backgroundColor: color, borderColor: color },
            ]}
        >
            <View style={[styles.fold, { borderBottomColor: color }]} />
            <View style={styles.lines}>
                <View
                    style={[
                        styles.line,
                        { backgroundColor: "rgba(0,0,0,0.2)", width: 20 },
                    ]}
                />
                <View
                    style={[
                        styles.line,
                        { backgroundColor: "rgba(0,0,0,0.2)", width: 14 },
                    ]}
                />
                <View
                    style={[
                        styles.line,
                        { backgroundColor: "rgba(0,0,0,0.2)", width: 17 },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    paper: {
        width: SIZE * 0.65,
        height: SIZE * 0.65,
        borderRadius: 2,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    fold: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: "transparent",
        borderBottomColor: "rgba(0,0,0,0.15)",
    },
    lines: {
        gap: 4,
        alignItems: "flex-start",
    },
    line: {
        height: 2,
        borderRadius: 1,
    },
});
