import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import styles from "../../../styles/common/Table05ReportsExpandingRows.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import ModalLoading from "../modals/ModalLoading";

export default function Table05ReportsExpandingRows({
  data,
  updateStagedArticlesTableWithReportArticles,
  setIsOpenModalReportDate,
  setSelectedReport,
  fetchReportZipFile,
  handleRecreateReport,
  setIsOpenAreYouSure,
  loading = false,
}) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpandRow = (rowIndex) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const columns = [
    {
      accessorKey: "crName",
      header: "CR Name",
      cell: (info) => <div>{info.getValue()}</div>,
    },
    {
      id: "reportId",
      header: "Report ID",
      cell: ({ row }) => {
        const highestId = [...row.original.reportsArray]
          .sort((a, b) => a.id - b.id)
          .at(-1).id;
        return (
          <div className={styles.divColumn}>
            <button
              onClick={() =>
                updateStagedArticlesTableWithReportArticles(
                  row.original.reportsArray
                    .at(-1)
                    .ArticleReportContracts.map(
                      (articleReportContract) => articleReportContract.articleId
                    )
                )
              }
            >
              {highestId}
            </button>
          </div>
        );
      },
    },
    {
      id: "dateSubmittedToClient",
      header: () => (
        <div>
          Submitted
          <div style={{ fontSize: "12px" }}>(ET)</div>
        </div>
      ),
      cell: ({ row }) => {
        const highestId = [...row.original.reportsArray]
          .sort((a, b) => a.id - b.id)
          .at(-1).id;
        const reportHighestId = row.original.reportsArray.find(
          (report) => report.id === highestId
        );
        return (
          <div className={styles.divColumn}>
            <button
              className={styles.btnDate}
              onClick={() => {
                setIsOpenModalReportDate(true);
                setSelectedReport(reportHighestId);
              }}
            >
              {reportHighestId?.dateSubmittedToClient
                ? reportHighestId?.dateSubmittedToClient.split("T")[0]
                : "missing value"}
            </button>
          </div>
        );
      },
    },
    {
      id: "articleCount",
      header: "Article Count",
      cell: ({ row }) => {
        const highestId = [...row.original.reportsArray]
          .sort((a, b) => a.id - b.id)
          .at(-1).id;
        const reportHighestId = row.original.reportsArray.find(
          (report) => report.id === highestId
        );
        return (
          <div className={styles.divColumn}>
            {reportHighestId?.ArticleReportContracts.length}
          </div>
        );
      },
    },
    {
      id: "manageReportButtons",
      header: "",
      cell: ({ row }) => {
        const highestId = [...row.original.reportsArray]
          .sort((a, b) => a.id - b.id)
          .at(-1).id;
        const reportHighestId = row.original.reportsArray.find(
          (report) => report.id === highestId
        );
        return (
          <div className={styles.divColumn}>
            <button
              onClick={() => {
                fetchReportZipFile(reportHighestId.id);
              }}
              className={styles.btnDownload}
            >
              <div className="tooltipWrapperCursorNormal">
                <span className={styles.faDownload} />

                <span className="tooltipText">Download report</span>
              </div>
            </button>
            <button
              onClick={() => {
                handleRecreateReport(reportHighestId.id);
              }}
              className={styles.btnRecreate}
            >
              <div className="tooltipWrapperCursorNormal">
                <span className={styles.faSquarePlus} />

                <span className="tooltipText">Recreate report</span>
              </div>
            </button>
            <button
              onClick={() => {
                setIsOpenAreYouSure(true);
                setSelectedReport(reportHighestId);
              }}
              className={styles.btnDelete}
            >
              <div className="tooltipWrapperCursorNormal">
                <span className={styles.faTrash} />

                <span className="tooltipText">Delete report</span>
              </div>
            </button>
          </div>
        );
      },
    },

    {
      id: "expandIcon",
      header: "",
      cell: ({ row }) => {
        const hasMultipleReports = row.original.reportsArray.length > 1;
        if (!hasMultipleReports) return null;

        return (
          <div
            style={{ cursor: "pointer", textAlign: "right" }}
            onClick={() => toggleExpandRow(row.index)}
          >
            <FontAwesomeIcon
              icon={expandedRows[row.index] ? faChevronDown : faChevronLeft}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { pagination, globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    autoResetPageIndex: false,
  });

  return loading ? (
    <div className={styles.divTableMain}>
      <ModalLoading isVisible={true} sizeOfParent={true} />
    </div>
  ) : (
    <div className={styles.divTableMain}>
      <div className={styles.divTableButtonsAndInputs}>
        <div className={styles.divShowRows}>
          Show rows:{" "}
          {[5, 10, 20].map((size) => (
            <button
              key={size}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageSize: size,
                  pageIndex: 0,
                }))
              }
            >
              {size}
            </button>
          ))}
        </div>
        <div className={styles.divInputSearchbar}>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.inputSearchbar}
            placeholder="Search..."
          />
        </div>
        <div className={styles.divPagination}>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"} Prev
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next {">"}
          </button>
        </div>
      </div>
      <table className={styles.tableRequest}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.tableRequestHeader}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler?.()}
                  style={{ cursor: "pointer" }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getPaginationRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {expandedRows[row.index] && (
                <tr className={styles.trExpandedRow}>
                  <td colSpan={table.getAllColumns().length}>
                    <table className={styles.tableRequest}>
                      <tbody className={styles.tbodyExpandedRow}>
                        {[...row.original.reportsArray]
                          .sort((a, b) => a.id - b.id)
                          .slice(0, -1)
                          .map((report) => (
                            <tr key={report.id}>
                              {/* crName */}
                              <td>
                                <div
                                  className={styles.divExpandedRowColumnLeft}
                                >
                                  {row.original.crName}
                                </div>
                              </td>
                              {/* reportId */}
                              <td>
                                <div className={styles.divExpandedRowColumn}>
                                  <button
                                    onClick={() => {
                                      updateStagedArticlesTableWithReportArticles(
                                        report.ArticleReportContracts.map(
                                          (arc) => arc.articleId
                                        )
                                      );
                                    }}
                                  >
                                    {report.id}
                                  </button>
                                </div>
                              </td>
                              {/* dateSubmittedToClient */}
                              <td>
                                <div className={styles.divExpandedRowColumn}>
                                  <button
                                    className={styles.btnDate}
                                    onClick={() => {
                                      setIsOpenModalReportDate(true);
                                      setSelectedReport(report);
                                    }}
                                  >
                                    {report.dateSubmittedToClient.split("T")[0]}
                                  </button>
                                </div>
                              </td>
                              {/* articleCount */}
                              <td>
                                <div className={styles.divExpandedRowColumn}>
                                  {report.ArticleReportContracts.length}
                                </div>
                              </td>
                              {/* manageReportButtons */}
                              <td>
                                <div
                                  className={
                                    styles.divExpandedManageReportsButtons
                                  }
                                >
                                  <button
                                    onClick={() => {
                                      fetchReportZipFile(report.id);
                                    }}
                                    className={styles.btnDownload}
                                  >
                                    <div className="tooltipWrapperCursorNormal">
                                      <span className={styles.faDownload} />
                                      <span className="tooltipText">
                                        Download report
                                      </span>
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleRecreateReport(report.id);
                                    }}
                                    className={styles.btnRecreate}
                                  >
                                    <div className="tooltipWrapperCursorNormal">
                                      <span className={styles.faSquarePlus} />

                                      <span className="tooltipText">
                                        Recreate report
                                      </span>
                                    </div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsOpenAreYouSure(true);
                                      setSelectedReport(report);
                                    }}
                                    className={styles.btnDelete}
                                  >
                                    <div className="tooltipWrapperCursorNormal">
                                      <span className={styles.faTrash} />
                                      <span className="tooltipText">
                                        Delete report
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
