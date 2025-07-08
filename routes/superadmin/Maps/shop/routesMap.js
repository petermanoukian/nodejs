//routes\superadmin\Maps\shop\routesMap.js

module.exports = {
  'super.categories': {
    view: '/superadmin/categories/view',
    new: '/superadmin/categories/new',
    add: '/superadmin/categories/add',
    edit: (id) => `/superadmin/categories/edit/${id}`,
    update: (id) => `/superadmin/categories/update/${id}`,
    delete: (id) => `/superadmin/categories/delete/${id}`,
    validate: '/superadmin/categories/validate-cat',
    validateEdit: (id) => `/superadmin/categories/validate-cat-edit/${id}`,
    deleteMany: '/superadmin/categories/delete-many'
  },
  'super.subcategories': {
    view: (catId) => `/superadmin/subcats/view${catId ? `/${catId}` : ''}`,
    new: (catId) => `/superadmin/subcats/new${catId ? `/${catId}` : ''}`,
    add: '/superadmin/subcats/add',
    edit: (id) => `/superadmin/subcats/edit/${id}`,
    update: (id) => `/superadmin/subcats/update/${id}`,
    delete: (id) => `/superadmin/subcats/delete/${id}`,
    validate: '/superadmin/subcats/validate',
    validateEdit: (id) => `/superadmin/subcats/validate-edit/${id}`,
    deleteMany: '/superadmin/subcats/delete-many'
  }
};
