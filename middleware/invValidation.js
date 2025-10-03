function validateClassification(req,res,next){
  const errors=[]
  const { classification_name } = req.body
  if(!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name)) {
    errors.push("Classification name required and must be alphanumeric")
  }
  if(errors.length){
    req.flash("errors", errors)
    req.flash("formData", req.body)
    return res.redirect("/inv/add-classification")
  }
  next()
}

function validateInventory(req,res,next){
  const errors=[]
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price } = req.body
  if(!classification_id) errors.push("Classification required")
  if(!inv_make) errors.push("Make required")
  if(!inv_model) errors.push("Model required")
  if(!inv_year || !/^\d{4}$/.test(inv_year)) errors.push("Year required, 4 digits")
  if(!inv_description || inv_description.length<10) errors.push("Description required, min 10 chars")
  if(!inv_image) errors.push("Image path required")
  if(!inv_thumbnail) errors.push("Thumbnail path required")
  if(!inv_price || isNaN(inv_price)) errors.push("Price required, numeric")
  if(errors.length){
    req.flash("errors", errors)
    req.flash("formData", req.body)
    return res.redirect("/inv/add-inventory")
  }
  next()
}

function validateInventoryUpdate(req, res, next) {
  const errors = []
  const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price } = req.body

  if(!inv_id) errors.push("Inventory ID is missing") // important for update
  if(!classification_id) errors.push("Classification required")
  if(!inv_make) errors.push("Make required")
  if(!inv_model) errors.push("Model required")
  if(!inv_year || !/^\d{4}$/.test(inv_year)) errors.push("Year required, 4 digits")
  if(!inv_description || inv_description.length < 10) errors.push("Description required, min 10 chars")
  if(!inv_image) errors.push("Image path required")
  if(!inv_thumbnail) errors.push("Thumbnail path required")
  if(!inv_price || isNaN(inv_price)) errors.push("Price required, numeric")

  if(errors.length){
    req.flash("errors", errors)
    req.flash("formData", req.body)
    // redirect back to edit view for this inventory item
    return res.redirect(`/inv/edit/${inv_id}`)
  }

  next()
}

module.exports = {
  validateClassification,
  validateInventory,
  validateInventoryUpdate
}
