type Nullable<T> = T | null | undefined
declare function KtSingleton<T>(): T & (abstract new() => any);
export declare interface KtList<E> /* extends Collection<E> */ {
    asJsReadonlyArrayView(): ReadonlyArray<E>;
    readonly __doNotUseOrImplementIt: {
        readonly "kotlin.collections.KtList": unique symbol;
    };
}
export declare abstract class KtList<E> extends KtSingleton<KtList.$metadata$.constructor>() {
    private constructor();
}
/** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
export declare namespace KtList.$metadata$ {
    abstract class constructor {
        fromJsArray<E>(array: ReadonlyArray<E>): KtList<E>;
        private constructor();
    }
}
export declare interface KtMap<K, V> {
    asJsReadonlyMapView(): ReadonlyMap<K, V>;
    readonly __doNotUseOrImplementIt: {
        readonly "kotlin.collections.KtMap": unique symbol;
    };
}
export declare abstract class KtMap<K, V> extends KtSingleton<KtMap.$metadata$.constructor>() {
    private constructor();
}
/** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
export declare namespace KtMap.$metadata$ {
    abstract class constructor {
        fromJsMap<K, V>(map: ReadonlyMap<K, V>): KtMap<K, V>;
        private constructor();
    }
}
export declare interface KtMutableMap<K, V> extends KtMap<K, V> {
    asJsMapView(): Map<K, V>;
    readonly __doNotUseOrImplementIt: {
        readonly "kotlin.collections.KtMutableMap": unique symbol;
    } & KtMap<K, V>["__doNotUseOrImplementIt"];
}
export declare abstract class KtMutableMap<K, V> extends KtSingleton<KtMutableMap.$metadata$.constructor>() {
    private constructor();
}
/** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
export declare namespace KtMutableMap.$metadata$ {
    abstract class constructor {
        fromJsMap<K, V>(map: ReadonlyMap<K, V>): KtMutableMap<K, V>;
        private constructor();
    }
}
export declare interface KtMutableList<E> extends KtList<E>/*, MutableCollection<E> */ {
    asJsArrayView(): Array<E>;
    readonly __doNotUseOrImplementIt: {
        readonly "kotlin.collections.KtMutableList": unique symbol;
    } & KtList<E>["__doNotUseOrImplementIt"];
}
export declare abstract class KtMutableList<E> extends KtSingleton<KtMutableList.$metadata$.constructor>() {
    private constructor();
}
/** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
export declare namespace KtMutableList.$metadata$ {
    abstract class constructor {
        fromJsArray<E>(array: ReadonlyArray<E>): KtMutableList<E>;
        private constructor();
    }
}
export declare interface KtMutableSet<E> extends KtSet<E>/*, MutableCollection<E> */ {
    asJsSetView(): Set<E>;
    readonly __doNotUseOrImplementIt: {
        readonly "kotlin.collections.KtMutableSet": unique symbol;
    } & KtSet<E>["__doNotUseOrImplementIt"];
}
export declare abstract class KtMutableSet<E> extends KtSingleton<KtMutableSet.$metadata$.constructor>() {
    private constructor();
}
/** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
export declare namespace KtMutableSet.$metadata$ {
    abstract class constructor {
        fromJsSet<E>(set: ReadonlySet<E>): KtMutableSet<E>;
        private constructor();
    }
}
export declare interface KtSet<E> /* extends Collection<E> */ {
    asJsReadonlySetView(): ReadonlySet<E>;
    readonly __doNotUseOrImplementIt: {
        readonly "kotlin.collections.KtSet": unique symbol;
    };
}
export declare abstract class KtSet<E> extends KtSingleton<KtSet.$metadata$.constructor>() {
    private constructor();
}
/** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
export declare namespace KtSet.$metadata$ {
    abstract class constructor {
        fromJsSet<E>(set: ReadonlySet<E>): KtSet<E>;
        private constructor();
    }
}
export declare class JsMutableMap<K, V> implements KtMutableMap<K, V> {
    constructor();
    asJsMapView(): Map<K, V>;
    asJsReadonlyMapView(): ReadonlyMap<K, V>;
    readonly __doNotUseOrImplementIt: KtMutableMap<K, V>["__doNotUseOrImplementIt"];
}
/** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
export declare namespace JsMutableMap.$metadata$ {
    const constructor: abstract new <K, V>() => JsMutableMap<K, V>;
}
export declare namespace JsMutableMap {
    class SimpleEntry<K, V> /* implements KtMutableMap.MutableEntry<K, V> */ {
        constructor(key: K, value: V);
    }
    /** @deprecated $metadata$ is used for internal purposes, please don't use it in your code, because it can be removed at any moment */
    namespace SimpleEntry.$metadata$ {
        const constructor: abstract new <K, V>() => SimpleEntry<K, V>;
    }
}