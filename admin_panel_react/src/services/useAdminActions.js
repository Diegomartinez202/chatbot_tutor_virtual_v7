// src/services/useAdminActions.js
import { useTrainBot } from "@/hooks/useTrainBot";
import { useUploadIntents } from "@/hooks/useUploadIntents";

export const useAdminActions = () => {
    return {
        trainMutation: useTrainBot(),
        uploadMutation: useUploadIntents()
    };
};