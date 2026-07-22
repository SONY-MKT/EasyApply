sed -i '/<div className="relative inline-block">/,/<\/div>/c\
                            <StatusDropdown value={app.status} onChange={(v) => updateStatus(app.id, v)} />' src/components/AdminDashboard.tsx

sed -i '/<div className="relative">/,/<\/div>/c\
                  <StatusDropdown value={selectedApp.status} onChange={(v) => updateStatus(selectedApp.id, v)} />' src/components/AdminDashboard.tsx
