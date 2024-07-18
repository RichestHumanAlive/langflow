import { DEL_KEY_ERROR_ALERT, DEL_KEY_ERROR_ALERT_PLURAL, DEL_KEY_SUCCESS_ALERT, DEL_KEY_SUCCESS_ALERT_PLURAL } from "@/constants/alerts_constants";
import { useDeleteApiKey } from "@/controllers/API/queries/api-keys";
import { SelectionChangedEvent } from "ag-grid-community";
import { useContext, useEffect, useRef, useState } from "react";
import TableComponent from "../../../../components/tableComponent";
import { AuthContext } from "../../../../contexts/authContext";
import useAlertStore from "../../../../stores/alertStore";
import ApiKeyHeaderComponent from "./components/ApiKeyHeader";
import { getColumnDefs } from "./helpers/column-defs";
import useApiKeys from "./hooks/use-api-keys";

export default function ApiKeysPage() {
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const { userData } = useContext(AuthContext);
  const [userId, setUserId] = useState("");
  const keysList = useRef([]);

  useEffect(() => {
    fetchApiKeys();
  }, [userData]);

  const { fetchApiKeys } = useApiKeys(
    userData,
    setLoadingKeys,
    keysList,
    setUserId,
  );

  function resetFilter() {
    fetchApiKeys();
  }

  const { mutate } = useDeleteApiKey();

  function handleDeleteApi() {
    for(let i = 0; i < selectedRows.length; i++) {
      mutate(
        { keyId: selectedRows[i] },
        {
          onSuccess: () => {
            resetFilter();
            setSuccessData({
              title:
                selectedRows.length === 1
                  ? DEL_KEY_SUCCESS_ALERT
                  : DEL_KEY_SUCCESS_ALERT_PLURAL,
            })
          },
          onError: (error) => {
            setErrorData({
              title:
                selectedRows.length === 1
                  ? DEL_KEY_ERROR_ALERT
                  : DEL_KEY_ERROR_ALERT_PLURAL,
              list: [error?.response?.data?.detail],
            })
          }
        },
      )
    }
  }

  const columnDefs = getColumnDefs();

  return (
    <div className="flex h-full w-full flex-col justify-between gap-6">
      <ApiKeyHeaderComponent
        selectedRows={selectedRows}
        fetchApiKeys={fetchApiKeys}
        userId={userId}
      />

      <div className="flex h-full w-full flex-col justify-between">
        <TableComponent
          key={"apiKeys"}
          onDelete={handleDeleteApi}
          overlayNoRowsTemplate="No data available"
          onSelectionChanged={(event: SelectionChangedEvent) => {
            setSelectedRows(event.api.getSelectedRows().map((row) => row.id));
          }}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          columnDefs={columnDefs}
          rowData={keysList.current}
        />
      </div>
    </div>
  );
}
