// src/services/useAdminActions.js
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
})

export const useAdminActions = () => {
    const trainMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(`${API_URL}/admin/train`, {}, {
                headers: getAuthHeaders()
            })
            return res.data
        },
        onError: (error) => {
            console.error('Error al entrenar:', error?.response?.data || error.message)
        }
    })

    const uploadMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(`${API_URL}/admin/upload`, {}, {
                headers: getAuthHeaders()
            })
            return res.data
        },
        onError: (error) => {
            console.error('Error al subir intents:', error?.response?.data || error.message)
        }
    })

    return {
        trainMutation,
        uploadMutation
    }
}
