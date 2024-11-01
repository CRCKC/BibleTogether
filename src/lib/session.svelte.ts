type User = {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    uid?: string | null;
};

export type SessionState = {
    user: User | null;
    loading?: boolean;
    loggedIn?: boolean;
};


export function createSession() {
	let current:SessionState = $state({user: null});

	return {
		get current() { return current },
        set (state: SessionState) {
            current = state;
        },
        update (fn: (state: SessionState) => SessionState) {
            current = fn(current);
        }
	};
}

export const session = createSession();