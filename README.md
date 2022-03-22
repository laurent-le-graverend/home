#  Laurent LG

_The source of my website www.legraverend.fr_

## Stack

### Create Stack:

```bash
export ARN_AWS_ACM=arn:aws:acm:us-east-1:731317556953:certificate/35b8308f-dc2c-405d-86ed-16b9850d6188
aws cloudformation update-stack \
    --stack-name home \
    --template-body file://./cloudformation/template.yml \
    --region us-east-1 \
    --profile laurent \
    --capabilities CAPABILITY_IAM \
    --parameters \
        ParameterKey=DomainName,ParameterValue=legraverend.fr \
        ParameterKey=FullDomainName,ParameterValue=www.legraverend.fr \
        ParameterKey=AcmCertificateArn,ParameterValue=$ARN_AWS_ACM
```

### Delete Stack

```bash
aws cloudformation delete-stack --stack-name home --region us-east-1
```
