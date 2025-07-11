<template>
  <div class="p-4">
    <n-data-table
      :columns="columns"
      :data="motorcycles"
      :loading="pending"
      :pagination="false"
      bordered
    />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NButton, NDataTable } from 'naive-ui'

interface Motorcycle {
  id: number
  brand: string
  model: string
  year: number
  created_at: string
  updated_at: string
}

const { data: motorcycles, pending, error } = await useFetch<Motorcycle[]>(
  'http://localhost:3000/motorcycles',
  { default: () => [] }
)
// const motorcycles = ref(
//     [
// 	{
// 		"id": 1,
// 		"brand": "Honda",
// 		"model": "CBR600RR",
// 		"year": 2023,
// 		"created_at": "2025-07-11T04:52:18.379Z",
// 		"updated_at": "2025-07-11T04:52:18.379Z"
// 	},
// 	{
// 		"id": 3,
// 		"brand": "Ducati",
// 		"model": "Panigale V4",
// 		"year": 2023,
// 		"created_at": "2025-07-11T04:52:18.407Z",
// 		"updated_at": "2025-07-11T04:52:18.407Z"
// 	}
// ]
// )
const handleEdit = (row: Motorcycle) => {
  console.log('Edit', row)
  // navigate or open modal
}

const handleDelete = (row: Motorcycle) => {
  console.log('Delete', row)
  // show confirmation or remove item
}

const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Brand', key: 'brand' },
  { title: 'Model', key: 'model' },
  { title: 'Year', key: 'year' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Updated At', key: 'updated_at' },
  {
    title: 'Actions',
    key: 'action',
    render: (row: Motorcycle) =>
      h('div', { class: 'flex gap-2' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleEdit(row)
          },
          { default: () => 'Edit' }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            ghost: true,
            onClick: () => handleDelete(row)
          },
          { default: () => 'Delete' }
        )
      ])
  }
]
</script>
