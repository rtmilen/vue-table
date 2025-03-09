<script setup lang="ts">
import { useUsersStore, PROTOCOL_TYPES } from "@/stores/users";

import type { Row, ProtocolTypeValue } from "@/stores/users";

interface Column {
	prop: keyof Row;
	pretty: string;
}

const usersStore = useUsersStore();

const columns: Column[] = [
	{ prop: "name", pretty: "Метки" },
	{ prop: "type", pretty: "Тип записи" },
	{ prop: "login", pretty: "Логин" },
	{ prop: "password", pretty: "Пароль" }
];

const onBlur = (row: Row, cell: keyof Row, ev: Event) => {
	const target = ev.target as HTMLInputElement;
	const cellData = row[cell];

	if (cellData.type === "text" || cellData.type === "password") {
		cellData.value = target.value;
	}

	usersStore.save();
};

const onInput = (row: Row, cell: keyof Row, ev: Event) => {
	const target = ev.target as HTMLInputElement;
	const cellData = row[cell];

	if (cellData.type === "text" || cellData.type === "password") {
		cellData.value = target.value;
	}
};

const onAddAccount = () => {
	usersStore.addEmpty();
};

const onRowProtocolTypeChange = (row: Row, event: Event) => {
	const target = event.target as HTMLSelectElement;
	const cellData = row.type;
	cellData.value = target.value as ProtocolTypeValue;

	if (cellData.value === PROTOCOL_TYPES.LDAP.value) {
		row.password.required = false;
		row.password.value = null;
	} else {
		row.password.required = true;
	}

	usersStore.save();
};
</script>

<template>
	<div class="flex flex-col gap-4">
		<div class="header flex gap-2 items-center">
			<h1 class="font-medium">Учетные записи</h1>
			<button 
				class="font-bold p-2 pl-4 pr-4 border-1 border-gray-300 rounded-sm cursor-pointer"
				@click="onAddAccount()">
				+
			</button>
		</div>

		<table class="border-separate border-spacing-2">
			<thead class="text-left">
				<tr>
					<th v-for="column in columns">{{ column.pretty }}</th>
				</tr>
			</thead>
			<tbody class="text-left">
				<tr v-for="(row, idx) in usersStore.rows">
					<template v-for="column in columns">
						<td v-if="column.prop == 'password' ? row.type.value != PROTOCOL_TYPES.LDAP.value : true"
							:colspan="column.prop == 'login' && row.type.value == PROTOCOL_TYPES.LDAP.value ? 2 : 1">
							<select v-if="row[column.prop].type === 'select' && column.prop == 'type'"
								@change="onRowProtocolTypeChange(row, $event)"
								class="w-full h-full border-1 border-gray-300 rounded-md p-1"
								:value="row[column.prop].value"
								:required="row[column.prop].required">
								<option :value="PROTOCOL_TYPES.LOCAL.value">{{ PROTOCOL_TYPES.LOCAL.pretty }}</option>
								<option :value="PROTOCOL_TYPES.LDAP.value">{{ PROTOCOL_TYPES.LDAP.pretty }}</option>
							</select>
							<div v-else-if="row[column.prop].type === 'password'" class="relative">
								<input type="password"
									@focus="($event.target as HTMLInputElement).setAttribute('type', 'text')" @blur="
										($event.target as HTMLInputElement).setAttribute('type', 'password');
									onBlur(row, column.prop, $event)
										" @input="onInput(row, column.prop, $event)" :value="row[column.prop].value"
									:required="row[column.prop].required"
									class="w-full border-1 p-1 pr-8 rounded-md border-gray-300 invalid:border-red-400 focus:border-fuchsia-400" />
							</div>
							<input v-else-if="row[column.prop].type == 'text'" v-focus
								@blur="onBlur(row, column.prop, $event)" @input="onInput(row, column.prop, $event)"
								type="text" :value="row[column.prop].value" :required="row[column.prop].required"
								class="w-full border-1 p-1 rounded-md border-gray-300 invalid:border-red-400 focus:border-fuchsia-400" />
						</td>
					</template>
					<td>
						<button class="w-full cursor-pointer p-2 text-center" @click="usersStore.remove(idx)">
							del
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>