import { useCallback, useEffect, useState } from "react";
import { loadHomeLayout, saveHomeLayout } from "@/storage/homeLayout";
import { HomeWidget, HomeWidgetType } from "@/types";

export function useHomeLayout() {
    const [widgets, setWidgets] = useState<HomeWidget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHomeLayout().then((list) => {
            setWidgets(list);
            setLoading(false);
        });
    }, []);

    const persist = useCallback((next: HomeWidget[]) => {
        setWidgets(next);
        saveHomeLayout(next);
    }, []);

    function addWidget(type: HomeWidgetType, folderId?: string) {
        const widget: HomeWidget = { id: `widget_${Date.now()}`, type };
        if (type === "photo" || type === "post-it") {
            widget.recencyIndex = widgets.filter((w) => w.type === type).length;
        }
        if (type === "pasta") {
            widget.folderId = folderId;
        }
        persist([...widgets, widget]);
    }

    function removeWidget(id: string) {
        persist(widgets.filter((w) => w.id !== id));
    }

    function reorderWidgets(next: HomeWidget[]) {
        persist(next);
    }

    return { widgets, loading, addWidget, removeWidget, reorderWidgets };
}
