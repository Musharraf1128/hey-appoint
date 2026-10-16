# Monitoring deployment

These files deploy the observability requirements for the capstone.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f monitoring/kube-prometheus-stack-values.yaml

kubectl apply -f monitoring/grafana-dashboard-configmap.yaml
helm upgrade --install appoint ./helm/appoint -n appoint \
  --set monitoring.serviceMonitor.enabled=true
```

Verify the target in Prometheus, then expose Grafana locally for the demo:

```bash
kubectl -n monitoring port-forward svc/monitoring-grafana 3001:80
kubectl -n monitoring get secret monitoring-grafana -o jsonpath='{.data.admin-password}' | base64 --decode; echo
```

Open `http://localhost:3001`; the **HeyAppoint API** dashboard should appear
after the backend receives traffic. The Prometheus Targets page should show the
`appoint-backend` ServiceMonitor endpoint as `UP`.
