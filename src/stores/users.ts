import { reactive } from 'vue'
import { defineStore } from 'pinia'

type ProtocolTypeEntry = {
	value: string;
	pretty: string;
};

export const PROTOCOL_TYPES = {
	LOCAL: {
		value: 'local',
		pretty: 'Локальная',
	},
	LDAP: {
		value: 'ldap',
		pretty: 'LDAP',
	},
} as const satisfies Record<string, ProtocolTypeEntry>;

export type ProtocolTypeValue = (typeof PROTOCOL_TYPES)[keyof typeof PROTOCOL_TYPES]['value'];

export interface TextCellData {
	type: 'text' | 'password';
	value: string | null;
	required?: boolean;
	max?: number;
}

export interface SelectCellData {
	type: 'select';
	required: boolean;
	value: ProtocolTypeValue;
}

export interface Row {
	name: TextCellData;
	type: SelectCellData;
	login: TextCellData;
	password: TextCellData;
}

export interface PackedRow {
	name: string[];
	type: ProtocolTypeValue;
	login: string;
	password: string | null;
};

export const useUsersStore = defineStore('users', () => {
	const rows = reactive<Row[]>([]);

	const addEmpty = () => {
		rows.push({
			name: {
				type: "text",
				value: '',
				max: 50
			},
			type: {
				type: "select",
				value: PROTOCOL_TYPES.LOCAL.value,
				required: true
			},
			login: {
				type: "text",
				value: '',
				required: true,
				max: 100
			},
			password: {
				type: "password",
				value: '',
				required: true,
				max: 100
			},
		});
	}

	const init = () => {
		const storedData = localStorage.getItem("state");

		if (!storedData) return;

		const parsedData: PackedRow[] = JSON.parse(storedData);

		parsedData.forEach(packedRow => {
			rows.push({
				name: {
					type: "text",
					value: packedRow.name.join(';'),
					max: 50
				},
				type: {
					type: "select",
					value: packedRow.type,
					required: true
				},
				login: {
					type: "text",
					value: packedRow.login,
					required: true,
					max: 100
				},
				password: {
					type: "password",
					value: packedRow.password,
					required: true,
					max: 100
				},
			});
		});
	};

	const update = (id: number, data: Row) => {
		rows[id] = data;
	}

	const remove = (id: number) => {
		rows.splice(id, 1);
	}

	const save = () => {
		let data: PackedRow[] = [];

		for (const row of rows) {
			data.push({
				name: row.name.value!.split(';'),
				type: row.type.value,
				login: row.login.value || "",
				password: row.password.value
			});
		}
		localStorage.setItem("state", JSON.stringify(data));
	}

	init();

	return { rows, addEmpty, update, remove, save };
});