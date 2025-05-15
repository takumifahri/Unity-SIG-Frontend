"use client"

import { useState, useEffect } from "react"
import { utils, writeFile } from "xlsx"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import axios from "axios"
import { Button, Snackbar } from "@mui/material"
import { Download } from "@mui/icons-material"
import Fade from "@mui/material/Fade"
const Keuangan = () => {
  const [keuanganList, setKeuanganList] = useState([
    {
      id: 1,
      keterangan: "Baju Lebaran",
      jenisPembayaran: "Cash",
      nominal: 2000000,
      tanggal: "2025-04-01",
      jenisKeuangan: "Pemasukan",
    },
    {
      id: 2,
      keterangan: "Seragam sekolah",
      jenisPembayaran: "Transfer Bank",
      nominal: 1500000,
      tanggal: "2025-04-03",
      jenisKeuangan: "Pemasukan",
    },
  ])

  const [pemasukan, setPemasukan] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const showLoadingSnackbar = (message) => {
    setSnackbarMessage(message)
    setSnackbarOpen(true)
    setIsLoading(true)
  }

  const fetchKeuangan = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/keuangan`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    console.log("keuangan masuk : ", res.data.data)
    setPemasukan(res.data.data.data)
  }

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(
      pemasukan?.map((item) => ({
        No: item.id,
        Keterangan: item.keterangan,
        "Jenis Pembayaran": item.jenis_pembayaran,
        "Nama Produk": item.order.custom_order?.jenis_baju || item.order.catalog?.nama_katalog,
        "Jumlah Produk": item.order.type,
        Nominal: item.nominal,
        Tanggal: new Date(item.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        "Jenis Pemesanan": item.order.type,
        "Jenis Keuangan": item.jenis_keuangan
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      })),
    )

    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Laporan Keuangan")
    writeFile(wb, "laporan_keuangan.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    doc.text("Laporan Keuangan JR Konveksi", 14, 15)

    const tableColumn = [
      "No",
      "Keterangan",
      "Jenis Pembayaran",
      "Nama Produk",
      "Jumlah Produk",
      "Nominal",
      "Tanggal",
      "Jenis Pemesanan",
      "Jenis Keuangan",
    ]
    const tableRows = pemasukan?.map((item, index) => [
      index + 1,
      item.keterangan,
      item.jenis_pembayaran,
      item.order.custom_order?.jenis_baju || item.order.catalog?.nama_katalog,
      item.order.type,
      `Rp ${item.nominal.toLocaleString()}`,
      new Date(item.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      }),
      item.order.type,
      item.jenis_keuangan
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: "grid",
      styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      },
      headStyles: {
      fillColor: [120, 87, 69],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
      },
    })

    doc.save("laporan_keuangan.pdf")
  }

  useEffect(() => {
    fetchKeuangan()
  }, [])
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Keuangan</h2>
        <div className="flex gap-2 mb-4">
          <Button
            variant="contained"
            color="success"
            startIcon={<Download />}
            onClick={() => {
              showLoadingSnackbar("Exporting to Excel...")
              setTimeout(() => {
                exportToExcel()
                setIsLoading(false)
                setSnackbarMessage("Excel file exported successfully!")
                setTimeout(() => {
                  setSnackbarOpen(false)
                }, 1500)
              }, 1000) // Simulate loading
            }}
            size="large"
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center"
          >
            Export Excel
          </Button>
          <Snackbar
            open={snackbarOpen}
            onClose={handleSnackbarClose}
            TransitionComponent={Fade}
            message={snackbarMessage}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          />
          <Button
            variant="contained"
            onClick={() => {
              showLoadingSnackbar("Exporting to PDF...")
              setTimeout(() => {
                exportToPDF()
                setIsLoading(false)
                setSnackbarMessage("PDF file exported successfully!")
                setTimeout(() => {
                  setSnackbarOpen(false)
                }, 1500)
              }, 1000) // Simulate loading
            }}
            startIcon={<Download />}
            size="large"
            color="error"
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
          >
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">No</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Keterangan</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Jenis Pembayaran</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Nama Produk</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Jumlah Produk</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Nominal</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Tanggal</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Jenis Pemesanan</th>
                <th className="text-center py-3  text-lg font-semibold text-gray-600">Jenis Keuangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pemasukan?.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="text-center py-4 text-md text-gray-500">{index + 1}</td>
                  <td className="text-center py-4 text-md text-gray-500">{item.keterangan}</td>
                  <td className="text-center py-4 text-md text-gray-500">{item.jenis_pembayaran}</td>
                  <td className="text-center py-4 text-md text-gray-500">
                    {item.order.custom_order?.jenis_baju || item.order.catalog?.nama_katalog}
                  </td>
                  <td className="text-center py-4 text-md text-gray-500">{item.order.type}</td>
                  <td className="text-center py-4 text-md text-gray-500">Rp {item.nominal.toLocaleString()}</td>
                  <td className="text-center py-4 text-md text-gray-500">
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="text-center py-4 text-md text-gray-500">{item.order.type}</td>
                  <td className="text-center py-4 text-md text-gray-500">
                    {item.jenis_keuangan
                      .toLowerCase()
                      .split(" ")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Keuangan
