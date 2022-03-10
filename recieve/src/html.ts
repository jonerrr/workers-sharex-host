export const genHTML = (
  type: string,
  dataCode: string,
  element: string,
  date: string,
  size: number,
  deletionCode: string | null,
  embed?: string,
): string => `
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${embed}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <title>${dataCode}</title>
    <style>
        #textData {
            word-wrap: break-word;
        }
    </style>
</head>
<body class="bg-dark">
<div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModal" aria-hidden="true">
    <div class="modal-dialog text-white modal-dialog-centered">
        <div class="modal-content bg-dark">
            <div class="modal-header bg-dark">
                <h5 class="modal-title" id="deleteModalTitle">Are you sure?</h5>
            </div>
            <div class="modal-body">
                This action is irreversible
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Nevermind</button>
                <button type="button" class="btn btn-danger" id="deleteConfirm">Delete</button>
            </div>
        </div>
    </div>
</div>
<div class="px-4 py-5 my-5 text-center">
  ${element}
    <p class="h6 text-white">Uploaded: ${date}</p>
    <p class="h6 text-white">Size: ${size} KB</p>
    <div class="col-lg-6 mx-auto">
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center pt-2">
        ${
          deletionCode
            ? `<button type="button" class="btn btn-danger btn-md px-4" data-bs-toggle="modal"
                    data-bs-target="#deleteModal" id="deleteStart">Delete
            </button>`
            : ``
        }
        </div>
    </div>
</div>
<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
    <div id="deleteToastSuccess" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto">Success</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            File deleted, it may take a few minutes to see the changes 
        </div>
    </div>
</div>
<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
    <div id="deleteToastError" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            An error occurred deleting this file
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
        crossorigin="anonymous">
</script>
<script>
${
  deletionCode
    ? `
    const deleteSuccess = document.getElementById('deleteToastSuccess')
    const deleteError = document.getElementById('deleteToastError')
    const toast = new bootstrap.Toast(deleteSuccess)
    const toastError = new bootstrap.Toast(deleteError)

    document.getElementById("deleteConfirm").addEventListener("click", async () => {

        const deleteButton = document.getElementById('deleteStart')
        const deleteModal = document.getElementById('deleteModal')
        const modal = bootstrap.Modal.getInstance(deleteModal)

        await fetch("${DELETION_API}", {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({deletionCode: "${deletionCode}", dataCode: "${dataCode}"}),
            headers: {
                "content-type": "application/json",
                "access-control-request-headers": "content-type"
            },
        }).catch(async (e) => {
            console.log(e)
            await toastError.show()
        })
            deleteButton.className += " disabled"
            await modal.hide()
            await toast.show()
    });`
    : ``
}

</script>
</body>
</html>`
