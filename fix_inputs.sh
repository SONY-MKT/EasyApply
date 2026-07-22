sed -i '622,624c\
                    <div className="relative">\
                      <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>\
                      <input\
                        type="number"\
                        value={editForm.amount || 0}\
                        onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}\
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"\
                      />\
                    </div>' src/components/AdminDashboard.tsx

sed -i '634,636c\
                    <div className="relative">\
                      <input\
                        type="number"\
                        value={editForm.termMonths || 0}\
                        onChange={(e) => setEditForm({...editForm, termMonths: Number(e.target.value)})}\
                        className="w-full pr-16 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"\
                      />\
                      <span className="absolute right-3 top-2 text-gray-500 font-medium">Months</span>\
                    </div>' src/components/AdminDashboard.tsx
