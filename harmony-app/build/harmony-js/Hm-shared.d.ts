import { KtSingleton } from "./Hm-proto-kt";
type Nullable<T> = T | null | undefined
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
