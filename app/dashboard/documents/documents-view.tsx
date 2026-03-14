"use client"

import { useMemo, useState, useTransition } from "react"
import { ExternalLinkIcon, FileCheckIcon, FileIcon, FileTextIcon, FolderOpenIcon, LockIcon, ShieldIcon, Trash2Icon, UploadIcon, UsersIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { deleteDocumentRecord, uploadDocument } from "./actions"

type HouseholdOption = {
  id: string
  name: string
}

type ClientOption = {
  id: string
  first_name: string
  last_name: string
}

type DocumentRow = {
  id: string
  title: string
  document_type: string
  classification: string | null
  version_label: string
  signed: boolean
  uploaded_at: string
  storage_path: string | null
  households: { name: string } | null
  clients: { first_name: string; last_name: string } | null
  download_url: string | null
}

const documentTypes = [
  "KYC Document",
  "Investment Policy Statement",
  "Portfolio Review",
  "Fee Disclosure",
  "Mandate Form",
  "Risk Profile Assessment",
  "Signed Agreement",
  "Tax Statement",
  "Other",
]

const classificationTone: Record<string, string> = {
  confidential: "bg-red-50 text-red-700 border-red-200",
  internal: "bg-amber-50 text-amber-700 border-amber-200",
  client_shared: "bg-blue-50 text-blue-700 border-blue-200",
  archive: "bg-gray-50 text-gray-600 border-gray-200",
}

const docTypeIcon: Record<string, typeof FileTextIcon> = {
  "KYC Document": FileCheckIcon,
  "Investment Policy Statement": FileTextIcon,
  "Portfolio Review": FileTextIcon,
  "Fee Disclosure": FileTextIcon,
  "Mandate Form": FileCheckIcon,
  "Risk Profile Assessment": FileTextIcon,
  "Signed Agreement": FileCheckIcon,
  "Tax Statement": FileTextIcon,
  "Other": FileIcon,
}

const docTypeIconColor: Record<string, string> = {
  "KYC Document": "bg-emerald-50 text-emerald-600",
  "Investment Policy Statement": "bg-blue-50 text-blue-600",
  "Portfolio Review": "bg-purple-50 text-purple-600",
  "Fee Disclosure": "bg-amber-50 text-amber-600",
  "Mandate Form": "bg-indigo-50 text-indigo-600",
  "Risk Profile Assessment": "bg-orange-50 text-orange-600",
  "Signed Agreement": "bg-emerald-50 text-emerald-600",
  "Tax Statement": "bg-slate-50 text-slate-600",
  "Other": "bg-gray-50 text-gray-500",
}

function getClientLabel(client: DocumentRow["clients"]) {
  if (!client) {
    return "-"
  }

  return `${client.first_name} ${client.last_name}`.trim()
}

export function DocumentsView({
  documents,
  households,
  clients,
}: {
  documents: DocumentRow[]
  households: HouseholdOption[]
  clients: ClientOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "signed" | "unsigned">("all")
  const [classificationFilter, setClassificationFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const signedMatches =
        filter === "all" ||
        (filter === "signed" && document.signed) ||
        (filter === "unsigned" && !document.signed)
      const classificationMatches =
        classificationFilter === "all" ||
        (document.classification ?? "unclassified") === classificationFilter

      return signedMatches && classificationMatches
    })
  }, [classificationFilter, documents, filter])

  const summary = useMemo(() => {
    const signedCount = documents.filter((document) => document.signed).length
    const linkedToHousehold = documents.filter((document) => document.households).length
    const confidentialCount = documents.filter(
      (document) => document.classification === "confidential",
    ).length

    return {
      signedCount,
      linkedToHousehold,
      confidentialCount,
    }
  }, [documents])

  async function handleUpload(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await uploadDocument(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setAddOpen(false)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this document record and its file?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteDocumentRecord(id)

      if (result?.error) {
        setError(result.error)
      }

      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Documents
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Secure client records, signed agreements, and operational files.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all">
              <UploadIcon className="mr-1.5 size-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Store a file and map it to a household or client record.
              </DialogDescription>
            </DialogHeader>
            <form action={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">File</label>
                <Input name="file" type="file" required className="h-10" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input name="title" placeholder="e.g. FY25 Portfolio Review Pack" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Document Type</label>
                  <select
                    name="document_type"
                    defaultValue="KYC Document"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {documentTypes.map((documentType) => (
                      <option key={documentType} value={documentType}>
                        {documentType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Classification</label>
                  <select
                    name="classification"
                    defaultValue="confidential"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="confidential">Confidential</option>
                    <option value="client_shared">Client Shared</option>
                    <option value="internal">Internal</option>
                    <option value="archive">Archive</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Household</label>
                  <select
                    name="household_id"
                    defaultValue=""
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {households.map((household) => (
                      <option key={household.id} value={household.id}>
                        {household.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Client</label>
                  <select
                    name="client_id"
                    defaultValue=""
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Version Label</label>
                  <Input name="version_label" defaultValue="v1" />
                </div>
                <label className="flex items-center gap-2 pt-7 text-sm text-gray-700">
                  <input
                    name="signed"
                    type="checkbox"
                    className="size-4 rounded border-gray-300"
                  />
                  Mark as signed / executed
                </label>
              </div>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="group border-gray-200 border-l-4 border-l-blue-500 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FileTextIcon className="size-5" />
              </div>
              <div>
                <CardDescription>Total Documents</CardDescription>
                <CardTitle className="text-3xl text-gray-900">{documents.length}</CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-gray-200 border-l-4 border-l-emerald-500 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <FileCheckIcon className="size-5" />
              </div>
              <div>
                <CardDescription>Signed Documents</CardDescription>
                <CardTitle className="text-3xl text-emerald-600">
                  {summary.signedCount}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-gray-200 border-l-4 border-l-purple-500 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <UsersIcon className="size-5" />
              </div>
              <div>
                <CardDescription>Linked to Households</CardDescription>
                <CardTitle className="text-3xl text-purple-600">
                  {summary.linkedToHousehold}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="group border-gray-200 border-l-4 border-l-red-500 bg-white shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <LockIcon className="size-5" />
              </div>
              <div>
                <CardDescription>Confidential</CardDescription>
                <CardTitle className="text-3xl text-red-600">
                  {summary.confidentialCount}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All" },
          { id: "signed", label: "Signed" },
          { id: "unsigned", label: "Unsigned" },
        ].map((item) => {
          const isActive = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as "all" | "signed" | "unsigned")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                isActive
                  ? item.id === "signed"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : item.id === "unsigned"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-gray-800 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {item.label}
            </button>
          )
        })}

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <select
          value={classificationFilter}
          onChange={(event) => setClassificationFilter(event.target.value)}
          className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <option value="all">All classifications</option>
          <option value="confidential">Confidential</option>
          <option value="client_shared">Client Shared</option>
          <option value="internal">Internal</option>
          <option value="archive">Archive</option>
          <option value="unclassified">Unclassified</option>
        </select>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredDocuments.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="font-semibold">Document</TableHead>
                <TableHead className="font-semibold">Household</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Classification</TableHead>
                <TableHead className="font-semibold">Version</TableHead>
                <TableHead className="font-semibold">Uploaded</TableHead>
                <TableHead className="w-28 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => {
                const DocIcon = docTypeIcon[document.document_type] ?? FileIcon
                const iconColor = docTypeIconColor[document.document_type] ?? "bg-gray-50 text-gray-500"

                return (
                  <TableRow key={document.id} className="group/row hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`flex size-9 items-center justify-center rounded-lg ${iconColor}`}>
                          <DocIcon className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{document.title}</p>
                          <p className="text-xs text-gray-400">{document.document_type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {document.households?.name ?? <span className="text-gray-300">-</span>}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {getClientLabel(document.clients) === "-" ? <span className="text-gray-300">-</span> : getClientLabel(document.clients)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          classificationTone[document.classification ?? ""] ?? "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        {document.classification === "confidential" && <LockIcon className="mr-1 size-3" />}
                        {document.classification === "client_shared" && <ShieldIcon className="mr-1 size-3" />}
                        {(document.classification ?? "unclassified").replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900">
                          {document.version_label}
                        </span>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            document.signed
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                              : "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200"
                          }`}
                        >
                          {document.signed ? "Signed" : "Unsigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(document.uploaded_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {document.download_url ? (
                          <a
                            href={document.download_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <ExternalLinkIcon className="size-4" />
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(document.id)}
                          disabled={deletingId === document.id}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <FolderOpenIcon className="size-6" />
            </div>
            <div>
              <p className="font-medium text-gray-500">No documents found</p>
              <p className="mt-1 text-sm text-gray-400">
                Upload a file to start building the document vault.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
