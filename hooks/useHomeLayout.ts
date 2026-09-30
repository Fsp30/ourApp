import { useCallback, useEffect, useState } from "react";
import { loadHomeLayout, saveHomeLayout } from "@/storage/homeLayout";
import { HomeWidget, HomeWidgetType } from "@/types";

const DEFAULT_TITLE = "Garagem Ferrari/Mercedes";

export function useHomeLayout() {
    const [title, setTitleState] = useState(DEFAULT_TITLE);
    const [widgets, setWidgets] = useState<HomeWidget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHomeLayout().then((data) => {
            setTitleState(data.title || DEFAULT_TITLE);
            setWidgets(data.widgets);
            setLoading(false);
        });
    }, []);

    const persistWidgets = useCallback(
        (next: HomeWidget[]) => {
            setWidgets(next);
            saveHomeLayout({ title, widgets: next });
        },
        [title],
    );

    function setTitle(next: string) {
        const value = next.trim() || DEFAULT_TITLE;
        setTitleState(value);
        saveHomeLayout({ title: value, widgets });
    }

    function addWidget(type: HomeWidgetType, folderId?: string) {
        const widget: HomeWidget = { id: `widget_${Date.now()}`, type };
        if (type === "photo" || type === "post-it") {
            widget.recencyIndex = widgets.filter((w) => w.type === type).length;
        }
        if (type === "pasta") widget.folderId = folderId;
        persistWidgets([...widgets, widget]);
    }

    function removeWidget(id: string) {
        persistWidgets(widgets.filter((w) => w.id !== id));
    }

    function moveWidget(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= widgets.length) return;
        const next = [...widgets];
        [next[index], next[target]] = [next[target], next[index]];
        persistWidgets(next);
    }

    return {
        title,
        setTitle,
        widgets,
        loading,
        addWidget,
        removeWidget,
        moveWidget,
    };
}
