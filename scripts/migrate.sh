for file in ./migrations/*.sql; do
  psql -U laxman-rumba -d contact-app -f "$file"
done
