#  Laurent LG [![Build Status](https://travis-ci.org/laurent-le-graverend/home.svg?branch=master)](https://travis-ci.org/laurent-le-graverend/home)

_Nothing fancy to see here! Just the sources of my website www.legraverend.fr_

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Stack

### Create Stack:

```bash
export ARN_AWS_ACM=arn:aws:acm:xxx
aws cloudformation update-stack \
    --stack-name home \
    --template-body file://./cloudformation/template.yml \
    --region us-east-1 \
    --capabilities CAPABILITY_IAM \
    --parameters \
        ParameterKey=DomainName,ParameterValue=legraverend.fr \
        ParameterKey=FullDomainName,ParameterValue=www.legraverend.fr \
        ParameterKey=AcmCertificateArn,ParameterValue=$ARN_AWS_ACM
```

### Delete Stack

```bash
aws cloudformation delete-stack --stack-name bandlab-namm-event --region us-east-1
```
